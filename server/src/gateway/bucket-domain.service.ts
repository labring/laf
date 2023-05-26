import { Injectable, Logger } from '@nestjs/common'
import { RegionService } from '../region/region.service'
import * as assert from 'node:assert'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { StorageBucket } from 'src/storage/entities/storage-bucket'
import { SystemDatabase } from 'src/system-database'
import { BucketDomain } from './entities/bucket-domain'
import { DomainPhase, DomainState } from './entities/runtime-domain'

@Injectable()
export class BucketDomainService {
  private readonly logger = new Logger(BucketDomainService.name)
  private readonly db = SystemDatabase.db

  constructor(private readonly regionService: RegionService) {}

  /**
   *  Create app domain in database
   */
  async create(bucket: StorageBucket) {
    const region = await this.regionService.findByAppId(bucket.appid)
    assert(region, 'region not found')

    // create domain in db
    const bucket_domain = `${bucket.name}.${region.storageConf.domain}`
    await this.db.collection<BucketDomain>('BucketDomain').insertOne({
      appid: bucket.appid,
      domain: bucket_domain,
      bucketName: bucket.name,
      state: DomainState.Active,
      phase: DomainPhase.Creating,
      lockedAt: TASK_LOCK_INIT_TIME,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return this.findOne(bucket)
  }

  /**
   * Find an app domain in database
   */
  async findOne(bucket: StorageBucket) {
    const doc = await this.db.collection<BucketDomain>('BucketDomain').findOne({
      appid: bucket.appid,
      bucketName: bucket.name,
    })

    return doc
  }

  async count(appid: string) {
    const count = await this.db
      .collection<BucketDomain>('BucketDomain')
      .countDocuments({ appid })

    return count
  }

  /**
   * Delete app domain in database:
   * - turn to `Deleted` state
   */
  async deleteOne(bucket: StorageBucket) {
    await this.db
      .collection<BucketDomain>('BucketDomain')
      .findOneAndUpdate(
        { _id: bucket._id },
        { $set: { state: DomainState.Deleted, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    return await this.findOne(bucket)
  }

  async deleteAll(appid: string) {
    const res = await this.db
      .collection<BucketDomain>('BucketDomain')
      .updateMany(
        { appid },
        { $set: { state: DomainState.Deleted, updatedAt: new Date() } },
      )

    return res
  }
}
