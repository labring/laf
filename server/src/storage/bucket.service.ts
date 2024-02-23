import { Injectable, Logger } from '@nestjs/common'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { RegionService } from '../region/region.service'
import { CreateBucketDto } from './dto/create-bucket.dto'
import { UpdateBucketDto } from './dto/update-bucket.dto'
import { MinioService } from './minio/minio.service'
import { SystemDatabase } from 'src/system-database'
import { StorageBucket, StorageWithRelations } from './entities/storage-bucket'
import { StoragePhase, StorageState } from './entities/storage-user'

@Injectable()
export class BucketService {
  private readonly logger = new Logger(BucketService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
  ) {}

  async create(appid: string, dto: CreateBucketDto) {
    const bucketName = dto.fullname(appid)

    // create bucket in db
    await this.db.collection<StorageBucket>('StorageBucket').insertOne({
      appid: appid,
      name: bucketName,
      policy: dto.policy,
      shortName: dto.shortName,
      state: StorageState.Active,
      phase: StoragePhase.Creating,
      lockedAt: TASK_LOCK_INIT_TIME,
      updatedAt: new Date(),
      createdAt: new Date(),
    })

    return this.findOne(appid, bucketName)
  }

  async count(appid: string) {
    const count = await this.db
      .collection<StorageBucket>('StorageBucket')
      .countDocuments({ appid })

    return count
  }

  async findOne(appid: string, name: string) {
    const bucket = await this.db
      .collection('StorageBucket')
      .aggregate<StorageWithRelations>()
      .match({ appid, name })
      .lookup({
        from: 'BucketDomain',
        localField: 'name',
        foreignField: 'bucketName',
        as: 'domain',
      })
      .unwind({
        path: '$domain',
        preserveNullAndEmptyArrays: true,
      })
      .lookup({
        from: 'WebsiteHosting',
        localField: 'name',
        foreignField: 'bucketName',
        as: 'websiteHosting',
      })
      .unwind({
        path: '$websiteHosting',
        preserveNullAndEmptyArrays: true,
      })
      .next()

    return bucket
  }

  async findAll(appid: string) {
    const buckets = await this.db
      .collection('StorageBucket')
      .aggregate<StorageWithRelations>()
      .match({ appid })
      .lookup({
        from: 'BucketDomain',
        localField: 'name',
        foreignField: 'bucketName',
        as: 'domain',
      })
      .unwind({
        path: '$domain',
        preserveNullAndEmptyArrays: true,
      })
      .lookup({
        from: 'WebsiteHosting',
        localField: 'name',
        foreignField: 'bucketName',
        as: 'websiteHosting',
      })
      .unwind({
        path: '$websiteHosting',
        preserveNullAndEmptyArrays: true,
      })
      .toArray()

    return buckets
  }

  async updateOne(bucket: StorageBucket, dto: UpdateBucketDto) {
    // update bucket in minio
    const region = await this.regionService.findByAppId(bucket.appid)
    const out = await this.minioService.updateBucketPolicy(
      region,
      bucket.name,
      dto.policy,
    )
    if (out.$metadata.httpStatusCode !== 204) {
      this.logger.error('update bucket in minio failed: ', out)
      return false
    }

    // update bucket in db
    const res = await this.db
      .collection<StorageBucket>('StorageBucket')
      .findOneAndUpdate(
        { appid: bucket.appid, name: bucket.name },
        { $set: { policy: dto.policy, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    return res
  }

  async deleteOne(bucket: StorageBucket) {
    const res = await this.db
      .collection<StorageBucket>('StorageBucket')
      .findOneAndUpdate(
        { appid: bucket.appid, name: bucket.name },
        { $set: { state: StorageState.Deleted, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    return res
  }
}
