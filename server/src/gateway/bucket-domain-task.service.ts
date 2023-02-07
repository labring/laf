import { Injectable, Logger } from '@nestjs/common'
import { BucketDomain, DomainPhase, DomainState } from '@prisma/client'
import { MongoService } from 'src/database/mongo.service'
import { RegionService } from 'src/region/region.service'
import { ApisixService } from './apisix.service'
import * as assert from 'node:assert'
import { Cron, CronExpression } from '@nestjs/schedule'
import { times } from 'lodash'

@Injectable()
export class BucketDomainTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 5 // concurrency count
  private readonly logger = new Logger(BucketDomainTaskService.name)

  constructor(
    private readonly mongoService: MongoService,
    private readonly apisixService: ApisixService,
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
   * - create bucket route
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    const res = await db
      .collection<BucketDomain>('BucketDomain')
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

    // create route first
    const route = await this.apisixService.createBucketRoute(
      region,
      doc.bucketName,
      doc.domain,
    )

    this.logger.debug('bucket route created:', route)

    // update phase to `Created`
    const updated = await db.collection<BucketDomain>('BucketDomain').updateOne(
      {
        _id: doc._id,
        phase: DomainPhase.Creating,
      },
      {
        $set: {
          phase: DomainPhase.Created,
          lockedAt: null,
        },
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
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    const res = await db
      .collection<BucketDomain>('BucketDomain')
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

    // delete route first
    const route = await this.apisixService.deleteBucketRoute(
      region,
      doc.bucketName,
    )

    this.logger.debug('bucket route deleted:', route)

    // update phase to `Deleted`
    const updated = await db.collection<BucketDomain>('BucketDomain').updateOne(
      {
        _id: doc._id,
        phase: DomainPhase.Deleting,
      },
      {
        $set: {
          phase: DomainPhase.Deleted,
          lockedAt: null,
        },
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
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    await db.collection<BucketDomain>('BucketDomain').updateMany(
      {
        state: DomainState.Active,
        phase: DomainPhase.Deleted,
      },
      {
        $set: {
          phase: DomainPhase.Creating,
          lockedAt: null,
        },
      },
    )
  }

  /**
   * State `Inactive`:
   * - move `Created` to `Deleting`
   */
  async handleInactiveState() {
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    await db.collection<BucketDomain>('BucketDomain').updateMany(
      {
        state: DomainState.Inactive,
        phase: DomainPhase.Created,
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: null,
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
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    await db.collection<BucketDomain>('BucketDomain').updateMany(
      {
        state: DomainState.Deleted,
        phase: DomainPhase.Created,
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: null,
        },
      },
    )

    await db.collection<BucketDomain>('BucketDomain').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }

  /**
   * Clear timeout locks
   */
  async clearTimeoutLocks() {
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    await db.collection<BucketDomain>('BucketDomain').updateMany(
      {
        lockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      },
      {
        $set: {
          lockedAt: null,
        },
      },
    )
  }
}
