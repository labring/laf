import { Injectable, Logger } from '@nestjs/common'
import {
  DomainPhase,
  DomainState,
  StorageBucket,
} from '@prisma/client'
import { RegionService } from 'src/region/region.service'
import * as assert from 'node:assert'
import { Cron, CronExpression } from '@nestjs/schedule'
import { times } from 'lodash'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { MinioService } from './minio/minio.service'
import { BucketDomainService } from 'src/gateway/bucket-domain.service'

@Injectable()
export class BucketTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 1 // concurrency count
  private readonly logger = new Logger(BucketTaskService.name)

  constructor(
    private readonly bucketDomainService: BucketDomainService,
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    // Phase `Creating` -> `Created`
    times(this.concurrency, () => this.handleCreatingPhase())

    // Phase `Deleting` -> `Deleted`
    times(this.concurrency, () => this.handleDeletingPhase())

    // Phase `Created` -> `Deleting`
    this.handleInactiveState()

    // Phase `Deleted` -> `Creating`
    this.handleActiveState()

    // Phase `Deleting` -> `Deleted`
    this.handleDeletedState()

    // Clear timeout locks
    this.clearTimeoutLocks()
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
          lockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        {
          $set: {
            lockedAt: new Date(),
          },
        },
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
        {
          _id: doc._id,
          phase: DomainPhase.Creating,
        },
        {
          $set: {
            phase: DomainPhase.Created,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
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
          lockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        {
          $set: {
            lockedAt: new Date(),
          },
        },
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

    // update phase to `Deleted`
    const updated = await db
      .collection<StorageBucket>('StorageBucket')
      .updateOne(
        {
          _id: doc._id,
          phase: DomainPhase.Deleting,
        },
        {
          $set: {
            phase: DomainPhase.Deleted,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
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
      },
      {
        $set: {
          phase: DomainPhase.Creating,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
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
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
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
        phase: DomainPhase.Created,
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    await db.collection<StorageBucket>('StorageBucket').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }

  /**
   * Clear timeout locks
   */
  async clearTimeoutLocks() {
    const db = SystemDatabase.db

    await db.collection<StorageBucket>('StorageBucket').updateMany(
      {
        lockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      },
      {
        $set: {
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }
}
