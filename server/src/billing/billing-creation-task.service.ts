import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  Application,
  ApplicationState,
} from 'src/application/entities/application'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import {
  ApplicationBilling,
  ApplicationBillingState,
} from './entities/application-billing'
import { CalculatePriceDto } from './dto/calculate-price.dto'
import { BillingService } from './billing.service'
import { ApplicationBundle } from 'src/application/entities/application-bundle'
import { BundleService } from 'src/application/bundle.service'

@Injectable()
export class BillingCreationTaskService {
  private readonly logger = new Logger(BillingCreationTaskService.name)
  private readonly lockTimeout = 15 // in second
  private readonly billingInterval = 60 * 60 // in second
  private lastTick = TASK_LOCK_INIT_TIME

  constructor(
    private readonly billing: BillingService,
    private readonly bundleService: BundleService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    // If billing creation task is disabled, return
    if (ServerConfig.DISABLED_BILLING_CREATION_TASK) {
      this.logger.warn('Skip billing creation task due to config')
      return
    }

    // If last tick is less than 1 minute ago, return
    // Limit concurrency? But then there's only ever one task, even with 3 server replicas. !!!
    if (Date.now() - this.lastTick.getTime() < 1000 * 60) {
      this.logger.debug(
        `Skip billing creation task due to last tick time ${this.lastTick.toISOString()}`,
      )
      return
    }

    // Handle application billing creation
    this.logger.debug('Start handling application billing creation')
    await this.handleApplicationBillingCreating()
  }

  private async handleApplicationBillingCreating() {
    this.lastTick = new Date()

    const db = SystemDatabase.db
    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          billingLockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
          latestBillingTime: {
            $lt: new Date(Date.now() - 1000 * this.billingInterval),
          },
        },
        { $set: { billingLockedAt: new Date() } },
      )

    if (!res.value) {
      this.logger.debug('No application found for billing')
      return
    }

    const app = res.value
    this.logger.debug(`Application found for billing: ${app.appid}`)

    try {
      const billingTime = await this.createApplicationBilling(app)
      if (!billingTime) {
        this.logger.warn(`No billing time found for application: ${app.appid}`)
        return
      }
    } catch (err) {
      this.logger.error(
        'handleApplicationBillingCreating error',
        err,
        err.stack,
      )
    } finally {
      this.handleApplicationBillingCreating()
    }
  }

  private async createApplicationBilling(app: Application): Promise<Date> {
    this.logger.debug(`Start creating billing for application: ${app.appid}`)

    const appid = app.appid

    // determine latest billing time & next metering time
    const latestBillingTime = app.latestBillingTime
    const nextMeteringTime = new Date(
      latestBillingTime.getTime() + 1000 * this.billingInterval,
    )

    if (nextMeteringTime > new Date()) {
      this.logger.warn(`No next metering time for application: ${appid}`)
      return
    }

    const meteringData = await this.billing.getMeteringData(
      app,
      latestBillingTime,
      nextMeteringTime,
    )
    if (meteringData.cpu === 0 && meteringData.memory === 0) {
      if (
        [ApplicationState.Running, ApplicationState.Restarting].includes(
          app.state,
        )
      ) {
        this.logger.warn(`No metering data found for application: ${appid}`)
      }
    }

    // get application bundle
    const bundle = await this.bundleService.findOne(appid)

    if (!bundle) {
      this.logger.warn(`No bundle found for application: ${appid}`)
      return
    }

    // calculate billing price
    const priceInput = this.buildCalculatePriceInput(app, meteringData, bundle)
    const priceResult = await this.billing.calculatePrice(priceInput)

    // free trial
    if (bundle.isTrialTier) {
      priceResult.total = 0
    }

    // create billing
    const startAt = new Date(
      nextMeteringTime.getTime() - 1000 * this.billingInterval,
    )

    const db = SystemDatabase.db
    const client = SystemDatabase.client
    const session = client.startSession()
    session.startTransaction()

    try {
      const inserted = await db
        .collection<ApplicationBilling>('ApplicationBilling')
        .insertOne(
          {
            appid,
            state:
              priceResult.total === 0
                ? ApplicationBillingState.Done
                : ApplicationBillingState.Pending,
            amount: priceResult.total,
            detail: {
              cpu: {
                usage: priceInput.cpu,
                amount: priceResult.cpu,
              },
              memory: {
                usage: priceInput.memory,
                amount: priceResult.memory,
              },
              databaseCapacity: {
                usage: priceInput.databaseCapacity,
                amount: priceResult.databaseCapacity,
              },
              storageCapacity: {
                usage: priceInput.storageCapacity,
                amount: priceResult.storageCapacity,
              },
              dedicatedDatabaseCPU: {
                usage: priceInput.dedicatedDatabase.cpu,
                amount: priceResult.dedicatedDatabase.cpu,
              },
              dedicatedDatabaseMemory: {
                usage: priceInput.dedicatedDatabase.memory,
                amount: priceResult.dedicatedDatabase.memory,
              },
              dedicatedDatabaseCapacity: {
                usage: priceInput.dedicatedDatabase.capacity,
                amount: priceResult.dedicatedDatabase.capacity,
              },
              networkTraffic: {
                usage: priceInput.networkTraffic,
                amount: priceResult.networkTraffic,
              },
            },
            startAt: startAt,
            endAt: nextMeteringTime,
            lockedAt: TASK_LOCK_INIT_TIME,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: app.createdBy,
          },
          {
            session,
          },
        )

      const billingTime = nextMeteringTime
      // unlock billing if billing time is not the latest
      if (Date.now() - billingTime.getTime() > 1000 * this.billingInterval) {
        this.logger.warn(
          `Unlocking billing for application: ${app.appid} since billing time is not the latest`,
        )

        await db.collection<Application>('Application').updateOne(
          { appid: app.appid },
          {
            $set: {
              billingLockedAt: TASK_LOCK_INIT_TIME,
              latestBillingTime: billingTime,
            },
          },
          { session },
        )
      } else {
        await db.collection<Application>('Application').updateOne(
          { appid: app.appid },
          {
            $set: {
              latestBillingTime: billingTime,
            },
          },
          { session },
        )
      }
      await session.commitTransaction()

      this.logger.log(
        `Billing creation complete for application: ${appid} from ${startAt.toISOString()} to ${nextMeteringTime.toISOString()} for billing ${
          inserted.insertedId
        }`,
      )
      return billingTime
    } catch (err) {
      await session.abortTransaction()
      throw err
    } finally {
      session.endSession()
    }
  }

  private buildCalculatePriceInput(
    app: Application,
    meteringData: any,
    bundle: ApplicationBundle,
  ) {
    const dto = new CalculatePriceDto()
    dto.regionId = app.regionId.toString()

    dto.cpu = meteringData.cpu
    dto.memory = meteringData.memory
    dto.storageCapacity = bundle.resource.storageCapacity
    dto.databaseCapacity = bundle.resource.databaseCapacity
    dto.networkTraffic = meteringData.networkTraffic || 0

    dto.dedicatedDatabase = {
      cpu: bundle.resource.dedicatedDatabase?.limitCPU || 0,
      memory: bundle.resource.dedicatedDatabase?.limitMemory || 0,
      capacity: bundle.resource.dedicatedDatabase?.capacity || 0,
      replicas: bundle.resource.dedicatedDatabase?.replicas || 0,
    }

    if (dto.cpu === 0 && dto.memory === 0) {
      dto.dedicatedDatabase.cpu = 0
      dto.dedicatedDatabase.memory = 0
    }

    return dto
  }
}
