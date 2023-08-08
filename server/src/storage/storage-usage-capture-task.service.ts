import { StorageUser } from './entities/storage-user'
import { MinioService } from 'src/storage/minio/minio.service'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { RegionService } from 'src/region/region.service'
import { SystemDatabase } from 'src/system-database'
import { StorageBucket } from 'src/storage/entities/storage-bucket'
import { ServerConfig } from 'src/constants'
import pLimit from 'src/utils/p-limit'

@Injectable()
export class StorageUsageCaptureTaskService {
  constructor(
    private readonly regionService: RegionService,
    private readonly minioService: MinioService,
  ) {}

  private readonly logger = new Logger(StorageUsageCaptureTaskService.name)
  private readonly db = SystemDatabase.db
  private readonly lockTimeout = 60 * 60 // in second
  private readonly limit = pLimit(2) // concurrency limit: 2

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
    if (ServerConfig.DISABLED_STORAGE_USAGE_CAPTURE_TASK) {
      return
    }

    const total = await this.db
      .collection<StorageUser>('StorageUser')
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
        this.handleCaptureStorageUsage().catch((err) => {
          this.logger.error('handleCaptureStorageUsage error', err)
        }),
      ),
    )

    this.logger.debug('Start StorageUsageCaptureTask, total: ' + taskAmount)
    await Promise.all(taskList)
  }

  async handleCaptureStorageUsage() {
    const res = await this.db
      .collection<StorageUser>('StorageUser')
      .findOneAndUpdate(
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

    this.captureStorageUsage(appid).catch((err) => {
      this.logger.error(`captureStorageUsage ${appid} error`, err)
    })
  }

  async captureStorageUsage(appid: string) {
    const region = await this.regionService.findByAppId(appid)

    const buckets = await this.db
      .collection<StorageBucket>('StorageBucket')
      .find({
        appid,
      })
      .toArray()

    let totalSize = 0 // byte

    for (const bucket of buckets) {
      const stats = await this.minioService.statsBucket(region, bucket.name)
      totalSize += stats.size
    }

    // save to storage
    await this.db.collection<StorageUser>('StorageUser').findOneAndUpdate(
      {
        appid,
      },
      {
        $set: {
          dataSize: totalSize / 1024 / 1024, // MB
          updatedAt: new Date(),
        },
      },
    )

    this.logger.log(
      `captureStorageUsage ${appid}: ${totalSize / 1024 / 1024} MB`,
    )
  }
}
