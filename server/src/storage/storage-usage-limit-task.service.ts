import { MinioService } from 'src/storage/minio/minio.service'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Application } from 'src/application/entities/application'
import { RegionService } from 'src/region/region.service'
import { SystemDatabase } from 'src/system-database'
import { ServerConfig } from 'src/constants'
import { StorageService } from 'src/storage/storage.service'
import { BundleService } from 'src/application/bundle.service'
import pLimit from 'src/utils/p-limit'
import { StorageUser } from 'src/storage/entities/storage-user'

@Injectable()
export class StorageUsageLimitTaskService {
  constructor(
    private readonly regionService: RegionService,
    private readonly storageService: StorageService,
    private readonly minioService: MinioService,
    private readonly bundleService: BundleService,
  ) {}

  private readonly logger = new Logger(StorageUsageLimitTaskService.name)
  private readonly db = SystemDatabase.db
  private readonly lockTimeout = 3 * 60 * 60 // in second
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
    if (ServerConfig.DISABLED_STORAGE_USAGE_LIMIT_TASK) {
      return
    }

    const total = await this.db
      .collection<Application>('Application')
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
        this.handleLimitStorageUsage().catch((err) => {
          this.logger.error('handleLimitStorageUsage error', err)
        }),
      ),
    )

    this.logger.debug('Start StorageUsageLimitTask, total: ' + taskAmount)
    await Promise.all(taskList)
  }

  async handleLimitStorageUsage() {
    const res = await this.db
      .collection<StorageUser>('StorageUser')
      .findOneAndUpdate(
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

    this.limitStorageUsage(appid).catch((err) => {
      this.logger.error(`limitStorageUsage ${appid} error`, err)
    })
  }

  async limitStorageUsage(appid: string) {
    const bundle = await this.bundleService.findOne(appid)
    const { storageCapacity } = bundle.resource
    const region = await this.regionService.findByAppId(appid)
    const storage = await this.storageService.findOne(appid)

    if (storageCapacity < storage.dataSize) {
      // overused
      await this.minioService.addUserToReadonlyGroup(region, appid)
    } else {
      await this.minioService.addUserToGroup(region, appid)
    }
  }
}
