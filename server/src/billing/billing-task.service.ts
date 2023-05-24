import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Application } from 'src/application/entities/application'
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

@Injectable()
export class BillingTaskService {
  private readonly logger = new Logger(BillingTaskService.name)
  private readonly lockTimeout = 60 * 60 + 60 // in second

  constructor(private readonly billing: BillingService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async tick() {
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

    if (total === 0) {
      return
    }

    let concurrency = total
    if (total > 30) {
      concurrency = 30
      setTimeout(() => {
        this.tick()
      }, 3000)
    }

    times(concurrency, () => {
      this.handleApplicationBilling().catch((err) => {
        this.logger.error('processApplicationBilling error', err)
      })
    })
  }

  private async handleApplicationBilling() {
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
        { sort: { billingLockedAt: 1, updatedAt: 1 } },
      )

    if (!res.value) {
      return
    }

    const app = res.value
    const billingTime = await this.processApplicationBilling(app)
    if (!billingTime) return

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

  private async processApplicationBilling(app: Application) {
    this.logger.debug(`processApplicationBilling ${app.appid}`)

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
    const meteringCollection = MeteringDatabase.db.collection('metering')
    const meteringData = await meteringCollection
      .find({ category: appid, time: nextMeteringTime }, { sort: { time: 1 } })
      .toArray()

    if (meteringData.length === 0) {
      return
    }

    // calculate billing
    const price = await this.calculatePrice(app, meteringData)

    // create billing
    const cpuMetering = meteringData.find((it) => it.property === 'cpu')
    const memoryMetering = meteringData.find((it) => it.property === 'memory')
    const databaseMetering = meteringData.find(
      (it) => it.property === 'storageCapacity',
    )
    const storageMetering = meteringData.find(
      (it) => it.property === 'databaseCapacity',
    )

    await db.collection<ApplicationBilling>('ApplicationBilling').insertOne({
      appid,
      state: ApplicationBillingState.Pending,
      amount: price.total,
      detail: {
        cpu: {
          usage: cpuMetering?.value || 0,
          amount: price.cpu,
        },
        memory: {
          usage: memoryMetering?.value || 0,
          amount: price.memory,
        },
        databaseCapacity: {
          usage: databaseMetering?.value || 0,
          amount: price.databaseCapacity,
        },
        storageCapacity: {
          usage: storageMetering?.value || 0,
          amount: price.storageCapacity,
        },
      },
      startAt: new Date(nextMeteringTime.getTime() - 1000 * 60 * 60),
      endAt: nextMeteringTime,
      lockedAt: TASK_LOCK_INIT_TIME,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return nextMeteringTime
  }

  private async calculatePrice(app: Application, meteringData: any[]) {
    const dto = new CalculatePriceDto()
    dto.regionId = app.regionId.toString()
    dto.cpu = 0
    dto.memory = 0
    dto.storageCapacity = 0
    dto.databaseCapacity = 0

    for (const item of meteringData) {
      if (item.property === 'cpu') dto.cpu = item.value
      if (item.property === 'memory') dto.memory = item.value
      if (item.property === 'storageCapacity') dto.storageCapacity = item.value
      if (item.property === 'databaseCapacity')
        dto.databaseCapacity = item.value
    }

    const result = await this.billing.calculatePrice(dto)
    return result
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
