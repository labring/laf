import { Injectable, Logger } from '@nestjs/common'
import { BucketDomain, DomainPhase, DomainState } from '@prisma/client'
import { RegionService } from 'src/region/region.service'
import { ApisixService } from './apisix.service'
import * as assert from 'node:assert'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'

@Injectable()
export class BucketDomainTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 1 // concurrency count
  private readonly logger = new Logger(BucketDomainTaskService.name)

  constructor(
    private readonly apisixService: ApisixService,
    private readonly regionService: RegionService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_GATEWAY_TASK) {
      return
    }

    // Phase `Creating` -> `Created`
    this.handleCreatingPhase()

    // Phase `Deleting` -> `Deleted`
    this.handleDeletingPhase()

    // Phase `Created` -> `Deleting`
    this.handleInactiveState()

    // Phase `Deleted` -> `Creating`
    this.handleActiveState()

    // Phase `Deleting` -> `Deleted`
    this.handleDeletedState()
  }

  /**
   * Phase `Creating`:
   * - create bucket route
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<BucketDomain>('BucketDomain')
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

    // create route first
    const route = await this.apisixService.createBucketRoute(
      region,
      doc.bucketName,
      doc.domain,
    )

    this.logger.debug('bucket route created:', route)

    // update phase to `Created`
    const updated = await db.collection<BucketDomain>('BucketDomain').updateOne(
      { _id: doc._id, phase: DomainPhase.Creating },
      {
        $set: { phase: DomainPhase.Created, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    if (updated.modifiedCount > 0)
      this.logger.debug('bucket domain phase updated to Created', doc)
  }

  /**
   * Phase `Deleting`:
   * - delete bucket route
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<BucketDomain>('BucketDomain')
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

    // delete route if exists
    const id = `bucket-${doc.bucketName}`
    const route = await this.apisixService.getRoute(region, id)
    if (route) {
      await this.apisixService.deleteBucketRoute(region, doc.bucketName)
      this.logger.log('bucket route deleted: ' + doc.bucketName)
    }

    // update phase to `Deleted`
    const updated = await db.collection<BucketDomain>('BucketDomain').updateOne(
      { _id: doc._id, phase: DomainPhase.Deleting },
      {
        $set: { phase: DomainPhase.Deleted, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    if (updated.modifiedCount > 0)
      this.logger.debug('bucket domain phase updated to Deleted', doc)
  }

  /**
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const db = SystemDatabase.db

    await db.collection<BucketDomain>('BucketDomain').updateMany(
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

    await db.collection<BucketDomain>('BucketDomain').updateMany(
      {
        state: DomainState.Inactive,
        phase: { $in: [DomainPhase.Created, DomainPhase.Creating] },
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

    await db.collection<BucketDomain>('BucketDomain').updateMany(
      {
        state: DomainState.Deleted,
        phase: DomainPhase.Created,
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: { phase: DomainPhase.Deleting, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    await db.collection<BucketDomain>('BucketDomain').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }
}
