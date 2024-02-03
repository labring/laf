import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DatabaseService } from 'src/database/database.service'
import { Database, DatabasePermission } from 'src/database/entities/database'
import { SystemDatabase } from 'src/system-database'
import { ServerConfig } from 'src/constants'
import { BundleService } from 'src/application/bundle.service'
import pLimit from 'src/utils/p-limit'
import { RegionService } from 'src/region/region.service'

@Injectable()
export class DatabaseUsageLimitTaskService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly bundleService: BundleService,
    private readonly regionService: RegionService,
  ) {}

  private readonly logger = new Logger(DatabaseUsageLimitTaskService.name)
  private readonly db = SystemDatabase.db
  private readonly lockTimeout = 60 * 60 * 3 // in second
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
    if (ServerConfig.DISABLED_DATABASE_USAGE_LIMIT_TASK) {
      return
    }

    const total = await this.db
      .collection<Database>('Database')
      .countDocuments({
        usageLimitLockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      })

    // remaining tasks
    const taskAmount = total - this.limit.pendingCount

    if (taskAmount <= 0) return

    const taskList = Array.from({ length: taskAmount }).map(() =>
      this.limit(() =>
        this.handleLimitDatabaseUsage().catch((err) => {
          this.logger.error('handleLimitDatabaseUsage error', err)
        }),
      ),
    )

    this.logger.debug('Start DatabaseUsageLimitTask, total: ' + taskAmount)
    await Promise.all(taskList)
  }

  async handleLimitDatabaseUsage() {
    const res = await this.db.collection<Database>('Database').findOneAndUpdate(
      {
        usageLimitLockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      },
      { $set: { usageLimitLockedAt: this.getLockTime() } },
    )

    if (!res.value) return

    const app = res.value
    const { appid } = app

    this.limitDatabaseUsage(appid).catch((err) => {
      this.logger.error(`limitDatabaseUsage ${appid} error`, err)
    })
  }

  async limitDatabaseUsage(appid: string) {
    const bundle = await this.bundleService.findOne(appid)
    const { databaseCapacity } = bundle.resource
    const database = await this.databaseService.findOne(appid)
    const region = await this.regionService.findByAppId(appid)
    const permission = await this.databaseService.getUserPermission(
      database.name,
      database.user,
      region,
    )

    if (databaseCapacity < database.dataSize) {
      // overused
      if (permission === DatabasePermission.ReadWrite) {
        await this.databaseService.revokeWritePermission(
          database.name,
          database.user,
          region,
        )
      }
    } else {
      if (permission === DatabasePermission.Read) {
        await this.databaseService.grantWritePermission(
          database.name,
          database.user,
          region,
        )
      }
    }
  }
}
