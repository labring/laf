import { MinioService } from 'src/storage/minio/minio.service'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { times } from 'lodash'
import { Application } from 'src/application/entities/application'
import { DatabaseService } from 'src/database/database.service'
import { Database, DatabasePermission } from 'src/database/entities/database'
import { RegionService } from 'src/region/region.service'
import { SystemDatabase } from 'src/system-database'
import { StorageBucket } from 'src/storage/entities/storage-bucket'
import { StorageUser } from 'src/storage/entities/storage-user'
import { ServerConfig } from 'src/constants'
import { ApplicationBundle } from 'src/application/entities/application-bundle'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class ResourceTaskService {
  constructor(
    private readonly regionService: RegionService,
    private readonly databaseService: DatabaseService,
    private readonly minioService: MinioService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private readonly logger = new Logger(ResourceTaskService.name)
  private readonly captureResourceUsageLockTimeout = 60 * 60 + 60 // in second
  private readonly detectResourceOverusedLockTimeout = 60 * 30 // in second

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

  @Cron(CronExpression.EVERY_5_MINUTES)
  async captureResourceUsage() {
    const db = SystemDatabase.db
    if (ServerConfig.DISABLED_RESOURCE_USAGE_TASK) {
      return
    }

    const total = await db
      .collection<Application>('Application')
      .countDocuments({
        resourceUsageLockedAt: {
          $lt: new Date(
            Date.now() - 1000 * this.captureResourceUsageLockTimeout,
          ),
        },
      })

    const concurrency = total > 2 ? 2 : total
    if (total > 2) {
      setTimeout(() => {
        this.captureResourceUsage()
      }, 1000)
    }

    times(concurrency, () => {
      this.handleCaptureResourceUsage().catch((err) => {
        this.logger.error('handleCaptureResourceUsage error', err)
      })
    })
  }

  async handleCaptureResourceUsage() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          resourceUsageLockedAt: {
            $lt: new Date(
              Date.now() - 1000 * this.captureResourceUsageLockTimeout,
            ),
          },
        },
        { $set: { resourceUsageLockedAt: this.getLockTime() } },
        {
          sort: { resourceUsageLockedAt: 1, updatedAt: 1 },
          returnDocument: 'after',
        },
      )

    if (!res.value) {
      return
    }

    const app = res.value
    const { appid } = app

    // Database Usage
    const database = await this.databaseService.findAndConnect(appid)
    if (database) {
      try {
        const data = await database.db.stats()
        const { dataSize } = data
        await db.collection<Database>('Database').findOneAndUpdate(
          {
            appid,
          },
          {
            $set: {
              dataSize: dataSize / 1024 / 1024,
              updatedAt: new Date(),
            },
          },
        )
      } finally {
        await database.client.close()
      }
    }

    // Storage Usage
    const region = await this.regionService.findByAppId(appid)

    const buckets = await db
      .collection<StorageBucket>('StorageBucket')
      .find({
        appid,
      })
      .toArray()

    if (!buckets || buckets.length <= 0) return

    let totalSize = 0 // byte

    for (const bucket of buckets) {
      const stats = await this.minioService.statsBucket(region, bucket.name)
      totalSize += stats.size
    }

    // save to database
    await db.collection<StorageUser>('StorageUser').findOneAndUpdate(
      {
        appid,
      },
      {
        $set: {
          dataSize: totalSize / 1024 / 1024,
          updatedAt: new Date(),
        },
      },
    )
  }

  @Cron(CronExpression.EVERY_SECOND)
  async detectResourceOverused() {
    this.handleDetectResourceOverused().catch((err) => {
      this.logger.error('handleDetectResourceOverused error', err)
    })
  }

  async handleDetectResourceOverused() {
    const db = SystemDatabase.db
    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          resourceOveruseDetectionLockedAt: {
            $lt: new Date(
              Date.now() - 1000 * this.detectResourceOverusedLockTimeout,
            ),
          },
        },
        { $set: { resourceOveruseDetectionLockedAt: new Date() } },
        {
          returnDocument: 'after',
        },
      )

    if (!res.value) {
      return
    }

    const app = res.value
    const { appid } = app

    const storage = await db.collection<StorageUser>('StorageUser').findOne({
      appid,
    })
    if (!storage) return

    const region = await this.regionService.findByAppId(appid)
    const database = await this.databaseService.findOne(appid)

    // get storageCapacity and databaseCapacity
    let bundle = await this.cacheManager.get<ApplicationBundle>(
      `laf:application:bundle:${appid}`,
    )
    if (!bundle) {
      bundle = await db
        .collection<ApplicationBundle>('ApplicationBundle')
        .findOne({ appid })
      await this.cacheManager.set(`laf:application:bundle:${appid}`, bundle)
    }

    const { storageCapacity, databaseCapacity } = bundle.resource

    // overused
    const permission = await this.databaseService.getUserPermission(
      database.name,
      database.user,
    )
    if (databaseCapacity < database.dataSize) {
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

    if (storageCapacity < storage.dataSize) {
      await this.minioService.addUserToReadonlyGroup(region, appid)
    } else {
      await this.minioService.addUserToGroup(region, appid)
    }
  }
}
