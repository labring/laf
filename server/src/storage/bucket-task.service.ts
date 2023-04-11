import { Injectable, Logger } from '@nestjs/common'
import {
  DomainPhase,
  DomainState,
  StorageBucket,
  WebsiteHosting,
} from '@prisma/client'
import { RegionService } from 'src/region/region.service'
import * as assert from 'node:assert'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { MinioService } from './minio/minio.service'
import { BucketDomainService } from 'src/gateway/bucket-domain.service'

@Injectable()
export class BucketTaskService {
  readonly lockTimeout = 30 // in second
  private readonly logger = new Logger(BucketTaskService.name)

  constructor(
    private readonly bucketDomainService: BucketDomainService,
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_STORAGE_TASK) {
      return
    }

    // Phase `Creating` -> `Created`
    this.handleCreatingPhase().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Deleting` -> `Deleted`
    this.handleDeletingPhase().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Created` -> `Deleting`
    this.handleInactiveState().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Deleted` -> `Creating`
    this.handleActiveState().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Deleting` -> `Deleted`
    this.handleDeletedState().catch((err) => {
      this.logger.error(err)
    })
  }

  /**
   * Phase `Creating`:
   * - create bucket
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<StorageBucket>('StorageBucket')
      .findOneAndUpdate(
        {
          phase: DomainPhase.Creating,
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
      )
    if (!res.value) return

    // get region by appid
    const doc = res.value
    const region = await this.regionService.findByAppId(doc.appid)
    assert(region, 'region not found')

    // create bucket in minio if not exists
    const out = await this.minioService.headBucket(region, doc.name)
    if (!out) {
      // create bucket in minio
      const out = await this.minioService.createBucket(
        region,
        doc.name,
        doc.policy,
      )

      if (out.$metadata.httpStatusCode !== 200) {
        this.logger.error('create bucket in minio failed: ', out)
        return
      }

      this.logger.debug('minio bucket created:', doc.name)
    }

    // create bucket domain if not exists
    let domain = await this.bucketDomainService.findOne(doc)
    if (!domain) {
      domain = await this.bucketDomainService.create(doc)
      this.logger.debug('bucket domain created:', domain)
    }

    // update phase to `Created`
    const updated = await db
      .collection<StorageBucket>('StorageBucket')
      .updateOne(
        { _id: doc._id, phase: DomainPhase.Creating },
        { $set: { phase: DomainPhase.Created, lockedAt: TASK_LOCK_INIT_TIME } },
      )

    if (updated.modifiedCount > 0)
      this.logger.debug('bucket phase updated to Created', doc)
  }

  /**
   * Phase `Deleting`:
   * - delete bucket
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<StorageBucket>('StorageBucket')
      .findOneAndUpdate(
        {
          phase: DomainPhase.Deleting,
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
      )
    if (!res.value) return

    // get region by appid
    const doc = res.value
    const region = await this.regionService.findByAppId(doc.appid)
    assert(region, 'region not found')

    // delete bucket in minio
    const exists = await this.minioService.headBucket(region, doc.name)
    if (exists) {
      const out = await this.minioService.forceDeleteBucket(region, doc.name)

      if (out.status === 'error') {
        this.logger.error('delete bucket in minio failed: ', out)
        return
      }
      this.logger.debug('minio bucket deleted:', doc.name)
    }

    // delete bucket domain
    const domain = await this.bucketDomainService.findOne(doc)
    if (domain) {
      await this.bucketDomainService.delete(doc)
      this.logger.debug('bucket domain deleted:', domain)
    }

    // delete bucket website if exists
    const websiteRes = await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .updateMany(
        { appid: doc.appid, bucketName: doc.name },
        { $set: { state: DomainState.Deleted } },
      )

    if (websiteRes.modifiedCount > 0) {
      this.logger.log('website state set to Deleted for bucket: ' + doc.name)
    }

    // update phase to `Deleted`
    const updated = await db
      .collection<StorageBucket>('StorageBucket')
      .updateOne(
        { _id: doc._id, phase: DomainPhase.Deleting },
        { $set: { phase: DomainPhase.Deleted, lockedAt: TASK_LOCK_INIT_TIME } },
      )

    if (updated.modifiedCount > 0)
      this.logger.debug('bucket phase updated to Deleted', doc)
  }

  /**
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const db = SystemDatabase.db

    await db.collection<StorageBucket>('StorageBucket').updateMany(
      {
        state: DomainState.Active,
        phase: DomainPhase.Deleted,
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: { phase: DomainPhase.Creating, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )
  }

  /**
   * State `Inactive`:
   * - move `Created` to `Deleting`
   */
  async handleInactiveState() {
    const db = SystemDatabase.db

    await db.collection<StorageBucket>('StorageBucket').updateMany(
      {
        state: DomainState.Inactive,
        phase: DomainPhase.Created,
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: { phase: DomainPhase.Deleting, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )
  }

  /**
   * State `Deleted`:
   * - move `Created` to `Deleting`
   * - delete `Deleted` documents
   */
  async handleDeletedState() {
    const db = SystemDatabase.db

    await db.collection<StorageBucket>('StorageBucket').updateMany(
      {
        state: DomainState.Deleted,
        phase: { $in: [DomainPhase.Created, DomainPhase.Creating] },
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: { phase: DomainPhase.Deleting, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    await db
      .collection<StorageBucket>('StorageBucket')
      .deleteMany({ state: DomainState.Deleted, phase: DomainPhase.Deleted })
  }
}
