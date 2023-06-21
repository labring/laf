import { MinioService } from 'src/storage/minio/minio.service'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Application } from 'src/application/entities/application'
import { DatabaseService } from 'src/database/database.service'
import { Database, DatabasePermission } from 'src/database/entities/database'
import { RegionService } from 'src/region/region.service'
import { SystemDatabase } from 'src/system-database'
import { StorageBucket } from 'src/storage/entities/storage-bucket'
import { StorageUser } from 'src/storage/entities/storage-user'
import { ServerConfig } from 'src/constants'
import { StorageService } from 'src/storage/storage.service'
import { BundleService } from 'src/application/bundle.service'
import pLimit from 'src/utils/p-limt'

@Injectable()
export class ResourceUsageCaptureTaskService {
  constructor(
    private readonly regionService: RegionService,
    private readonly storageService: StorageService,
    private readonly databaseService: DatabaseService,
    private readonly minioService: MinioService,
    private readonly bundleService: BundleService,
  ) {}

  private readonly logger = new Logger(ResourceUsageCaptureTaskService.name)
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
    if (ServerConfig.DISABLED_RESOURCE_USAGE_CAPTURE_TASK) {
      return
    }

    const total = await this.db
      .collection<Application>('Application')
      .countDocuments({
        resourceUsageLockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      })

    // remaining tasks
    const taskAmount = total - this.limit.pendingCount

    if (taskAmount <= 0) return

    const taskList = Array.from({ length: taskAmount }).map(() =>
      this.limit(() =>
        this.handleCaptureResourceUsage().catch((err) => {
          this.logger.error('handleCaptureResourceUsage error', err)
        }),
      ),
    )

    this.logger.debug('Start ResourceUsageCaptureTask, total: ' + taskAmount)
    await Promise.all(taskList)
  }

  async handleCaptureResourceUsage() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          resourceUsageLockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        { $set: { resourceUsageLockedAt: this.getLockTime() } },
      )

    if (!res.value) return

    const app = res.value
    const { appid } = app

    this.captureDatabaseUsage(appid)
      .catch((err) => {
        this.logger.error(`captureDatabaseUsage ${appid} error`, err)
      })
      .then(() => this.limitDatabaseUsage(appid))
      .catch((err) => {
        this.logger.error(`limitDatabaseUsage ${appid} error`, err)
      })

    this.captureStorageUsage(appid)
      .catch((err) => {
        this.logger.error(`captureStorageUsage ${appid} error`, err)
      })
      .then(() => this.limitStorageUsage(appid))
      .catch((err) => {
        this.logger.error(`limitStorageUsage ${appid} error`, err)
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

  async captureDatabaseUsage(appid: string) {
    const { db, client } = await this.databaseService.findAndConnect(appid)
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

  async limitDatabaseUsage(appid: string) {
    const bundle = await this.bundleService.findOne(appid)
    const { databaseCapacity } = bundle.resource
    const database = await this.databaseService.findOne(appid)
    const permission = await this.databaseService.getUserPermission(
      database.name,
      database.user,
    )

    if (databaseCapacity < database.dataSize) {
      // overused
      if (permission === DatabasePermission.ReadWrite) {
        await this.databaseService.revokeWritePermission(
          database.name,
          database.user,
        )
      }
    } else {
      if (permission === DatabasePermission.Read) {
        await this.databaseService.grantWritePermission(
          database.name,
          database.user,
        )
      }
    }
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
