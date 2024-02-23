import { Injectable, Logger } from '@nestjs/common'
import { GenerateAlphaNumericPassword } from 'src/utils/random'
import { MinioService } from './minio/minio.service'
import { RegionService } from 'src/region/region.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import {
  StoragePhase,
  StorageState,
  StorageUser,
} from './entities/storage-user'
import { StorageBucket } from './entities/storage-bucket'
import { CloudBinBucketService } from './cloud-bin-bucket.service'

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
    private readonly cloudBinBucketService: CloudBinBucketService,
  ) {}

  async create(appid: string) {
    const accessKey = appid
    const secretKey = GenerateAlphaNumericPassword(64)

    // create storage user in database
    await this.db.collection<StorageUser>('StorageUser').insertOne({
      appid,
      accessKey,
      secretKey,
      dataSize: 0,
      state: StorageState.Active,
      phase: StoragePhase.Creating,
      lockedAt: TASK_LOCK_INIT_TIME,
      usageCaptureLockedAt: TASK_LOCK_INIT_TIME,
      usageLimitLockedAt: TASK_LOCK_INIT_TIME,
      updatedAt: new Date(),
      createdAt: new Date(),
    })

    // ensure cloud-bin bucket
    await this.cloudBinBucketService.ensureCloudBinBucket(appid)

    return await this.findOne(appid)
  }

  async findOne(appid: string) {
    const user = await this.db
      .collection<StorageUser>('StorageUser')
      .findOne({ appid })

    return user
  }

  async deleteUsersAndBuckets(appid: string) {
    // delete buckets & files
    await this.db
      .collection<StorageBucket>('StorageBucket')
      .updateMany(
        { appid, state: { $ne: StorageState.Deleted } },
        { $set: { state: StorageState.Deleted, updatedAt: new Date() } },
      )

    // delete user in minio
    await this.db.collection<StorageUser>('StorageUser').findOneAndUpdate(
      {
        appid,
        state: { $ne: StorageState.Deleted },
      },
      {
        $set: { state: StorageState.Deleted, updatedAt: new Date() },
      },
    )

    return
  }
}
