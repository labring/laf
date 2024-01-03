import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DatabaseService } from 'src/database/database.service'
import { Database } from 'src/database/entities/database'
import { SystemDatabase } from 'src/system-database'
import { ServerConfig } from 'src/constants'
import pLimit from 'src/utils/p-limit'

@Injectable()
export class DatabaseUsageCaptureTaskService {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly logger = new Logger(DatabaseUsageCaptureTaskService.name)
  private readonly db = SystemDatabase.db
  private readonly lockTimeout = 60 * 60 // in second
  private readonly limit = pLimit(10) // concurrency limit: 10

  private getLockTime() {
    // halfway through each hour
    const latestTime = new Date()
    latestTime.setMinutes(30)
    latestTime.setSeconds(0)
    latestTime.setMilliseconds(0)
    if (latestTime.getTime() > Date.now()) {
      latestTime.setTime(latestTime.getTime() - 1000 * 60 * 60)
    }
    return latestTime
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (ServerConfig.DISABLED_DATABASE_USAGE_CAPTURE_TASK) {
      return
    }

    const total = await this.db
      .collection<Database>('Database')
      .countDocuments({
        usageCaptureLockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      })

    // remaining tasks
    const taskAmount = total - this.limit.pendingCount

    if (taskAmount <= 0) return

    const taskList = Array.from({ length: taskAmount }).map(() =>
      this.limit(() =>
        this.handleCaptureDatabaseUsage().catch((err) => {
          this.logger.error('handleCaptureDatabaseUsage error', err)
        }),
      ),
    )

    this.logger.debug('Start DatabaseUsageCaptureTask, total: ' + taskAmount)
    await Promise.all(taskList)
  }

  async handleCaptureDatabaseUsage() {
    const res = await this.db.collection<Database>('Database').findOneAndUpdate(
      {
        usageCaptureLockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      },
      { $set: { usageCaptureLockedAt: this.getLockTime() } },
    )

    if (!res.value) return

    const app = res.value
    const { appid } = app

    this.captureDatabaseUsage(appid).catch((err) => {
      this.logger.error(`captureDatabaseUsage ${appid} error`, err)
    })
  }

  async captureDatabaseUsage(appid: string) {
    const res = await this.databaseService.findAndConnect(appid)
    if (!res) return
    const { client, db } = res
    try {
      const data = await db.stats()
      const { dataSize } = data
      await this.db.collection<Database>('Database').findOneAndUpdate(
        {
          appid,
        },
        {
          $set: {
            dataSize: dataSize / 1024 / 1024, // MB
            updatedAt: new Date(),
          },
        },
      )

      this.logger.log(
        `captureDatabaseUsage ${appid}: ${dataSize / 1024 / 1024} MB`,
      )
    } finally {
      await client.close()
    }
  }
}
