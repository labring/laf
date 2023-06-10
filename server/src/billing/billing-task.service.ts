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
import { MeteringDatabase } from './metering-database'
import { CalculatePriceDto } from './dto/calculate-price.dto'
import { BillingService } from './billing.service'
import { times } from 'lodash'
import { ApplicationBundle } from 'src/application/entities/application-bundle'
import * as assert from 'assert'
import { Account } from 'src/account/entities/account'
import { AccountTransaction } from 'src/account/entities/account-transaction'
import Decimal from 'decimal.js'

@Injectable()
export class BillingTaskService {
  private readonly logger = new Logger(BillingTaskService.name)
  private readonly lockTimeout = 60 * 60 + 60 // in second

  constructor(private readonly billing: BillingService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async createBillingScheduler() {
    const db = SystemDatabase.db
    if (ServerConfig.DISABLED_BILLING_TASK) {
      return
    }

    const total = await db
      .collection<Application>('Application')
      .countDocuments({
        billingLockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      })

    const concurrency = total > 2 ? 2 : total
    if (total > 2) {
      setTimeout(() => {
        this.createBillingScheduler()
      }, 1000)
    }

    times(concurrency, () => {
      this.handleApplicationBillingCreating().catch((err) => {
        this.logger.error('handleApplicationBillingCreating error', err)
      })
    })
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async payBillingScheduler() {
    const db = SystemDatabase.db
    if (ServerConfig.DISABLED_BILLING_TASK) {
      return
    }

    const total = await db
      .collection<ApplicationBilling>('ApplicationBilling')
      .countDocuments({
        state: ApplicationBillingState.Pending,
        lockedAt: { $lt: new Date(Date.now() - 1000 * 60) },
      })

    const concurrency = total > 2 ? 2 : total
    if (total > 2) {
      setTimeout(() => {
        this.payBillingScheduler()
      }, 1000)
    }

    times(concurrency, () => {
      this.handlePendingApplicationBilling().catch((err) => {
        this.logger.error('handlePendingApplicationBilling error', err)
      })
    })
  }

  private async handlePendingApplicationBilling() {
    const db = SystemDatabase.db

    const res = await db
      .collection<ApplicationBilling>('ApplicationBilling')
      .findOneAndUpdate(
        {
          state: ApplicationBillingState.Pending,
          lockedAt: {
            $lt: new Date(Date.now() - 1000 * 60),
          },
        },
        { $set: { lockedAt: new Date() } },
        { returnDocument: 'after' },
      )

    if (!res.value) {
      return
    }

    const billing = res.value

    // get account
    const account = await db
      .collection<Account>('Account')
      .findOne({ createdBy: billing.createdBy })

    assert(account, `Account ${billing.createdBy} not found`)

    // pay billing
    const session = SystemDatabase.client.startSession()

    try {
      await session.withTransaction(async () => {
        // update the account balance
        const amount = new Decimal(billing.amount).mul(100).toNumber()

        // TODO: write lock might cause performance issue?
        const res = await db
          .collection<Account>('Account')
          .findOneAndUpdate(
            { _id: account._id },
            { $inc: { balance: -amount } },
            { session, returnDocument: 'after' },
          )

        assert(res.value, `Account ${account._id} not found`)

        // create transaction
        await db.collection<AccountTransaction>('AccountTransaction').insertOne(
          {
            accountId: account._id,
            amount: -amount,
            balance: res.value.balance,
            message: `Application ${billing.appid} billing`,
            billingId: billing._id,
            createdAt: new Date(),
          },
          { session },
        )

        // update billing state
        await db
          .collection<ApplicationBilling>('ApplicationBilling')
          .updateOne(
            { _id: billing._id },
            { $set: { state: ApplicationBillingState.Done } },
            { session },
          )

        // stop application if balance is not enough
        if (res.value.balance < 0) {
          await db
            .collection<Application>('Application')
            .updateOne(
              { appid: billing.appid, state: ApplicationState.Running },
              { $set: { state: ApplicationState.Stopped } },
              { session },
            )
        }
      })
    } finally {
      session.endSession()
    }
  }

  private async handleApplicationBillingCreating() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          billingLockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        { $set: { billingLockedAt: this.getHourTime() } },
        { sort: { billingLockedAt: 1, updatedAt: 1 }, returnDocument: 'after' },
      )

    if (!res.value) {
      return
    }

    const app = res.value
    const billingTime = await this.createApplicationBilling(app)
    if (!billingTime) return

    // unlock billing if billing time is not the latest
    if (Date.now() - billingTime.getTime() > 1000 * this.lockTimeout) {
      await db
        .collection<Application>('Application')
        .updateOne(
          { appid: app.appid },
          { $set: { billingLockedAt: TASK_LOCK_INIT_TIME } },
        )
      return
    }
  }

  private async createApplicationBilling(app: Application) {
    const appid = app.appid
    const db = SystemDatabase.db

    // determine latest billing time & next metering time
    const latestBillingTime = await this.getLatestBillingTime(appid)
    const nextMeteringTime = await this.determineNextMeteringTime(
      appid,
      latestBillingTime,
    )

    if (!nextMeteringTime) {
      return
    }

    // lookup metering data
    const meteringData = await MeteringDatabase.db
      .collection('metering')
      .find({ category: appid, time: nextMeteringTime }, { sort: { time: 1 } })
      .toArray()

    if (meteringData.length === 0) {
      return
    }

    // get application bundle
    const bundle = await db
      .collection<ApplicationBundle>('ApplicationBundle')
      .findOne({ appid: app.appid })

    assert(bundle, `bundle not found ${app.appid}`)

    // calculate billing price
    const priceInput = this.buildCalculatePriceInput(app, meteringData, bundle)
    const priceResult = await this.billing.calculatePrice(priceInput)

    // free trial
    if (bundle.isTrialTier) {
      priceResult.total = 0
    }

    // create billing
    await db.collection<ApplicationBilling>('ApplicationBilling').insertOne({
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
      },
      startAt: new Date(nextMeteringTime.getTime() - 1000 * 60 * 60),
      endAt: nextMeteringTime,
      lockedAt: TASK_LOCK_INIT_TIME,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: app.createdBy,
    })

    return nextMeteringTime
  }

  private buildCalculatePriceInput(
    app: Application,
    meteringData: any[],
    bundle: ApplicationBundle,
  ) {
    const dto = new CalculatePriceDto()
    dto.regionId = app.regionId.toString()
    dto.cpu = 0
    dto.memory = 0
    dto.storageCapacity = 0
    dto.databaseCapacity = 0

    for (const item of meteringData) {
      if (item.property === 'cpu') dto.cpu = item.value
      if (item.property === 'memory') dto.memory = item.value
    }

    dto.storageCapacity = bundle.resource.storageCapacity
    dto.databaseCapacity = bundle.resource.databaseCapacity

    return dto
  }

  private async determineNextMeteringTime(
    appid: string,
    latestBillingTime: Date,
  ) {
    const db = MeteringDatabase.db
    const nextMeteringData = await db
      .collection('metering')
      .findOne(
        { category: appid, time: { $gt: latestBillingTime } },
        { sort: { time: 1 } },
      )

    if (!nextMeteringData) {
      return null
    }

    return nextMeteringData.time as Date
  }

  private async getLatestBillingTime(appid: string) {
    const db = SystemDatabase.db

    // get latest billing
    // TODO: perf issue?
    const latestBilling = await db
      .collection<ApplicationBilling>('ApplicationBilling')
      .findOne({ appid }, { sort: { endAt: -1 } })

    if (latestBilling) {
      return latestBilling.endAt
    }

    const latestTime = this.getHourTime()
    latestTime.setHours(latestTime.getHours() - 1)

    return latestTime
  }

  private getHourTime() {
    const latestTime = new Date()
    latestTime.setMinutes(0)
    latestTime.setSeconds(0)
    latestTime.setMilliseconds(0)
    return latestTime
  }
}
