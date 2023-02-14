import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  BucketDomain,
  DomainPhase,
  DomainState,
  WebsiteHosting,
} from '@prisma/client'
import { times } from 'lodash'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { RegionService } from 'src/region/region.service'
import * as assert from 'node:assert'
import { ApisixService } from './apisix.service'

@Injectable()
export class WebsiteTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 1 // concurrency count
  private readonly logger = new Logger(WebsiteTaskService.name)

  constructor(
    private readonly regionService: RegionService,
    private readonly apisixService: ApisixService,
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
   * - create website route
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<WebsiteHosting>('WebsiteHosting')
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

    this.logger.debug(res.value)
    // get region by appid
    const site = res.value
    const region = await this.regionService.findByAppId(site.appid)
    assert(region, 'region not found')

    // get bucket domain
    const bucketDomain = await db
      .collection<BucketDomain>('BucketDomain')
      .findOne({
        appid: site.appid,
        bucketName: site.bucketName,
      })

    assert(bucketDomain, 'bucket domain not found')

    // create website route
    const route = await this.apisixService.createWebsiteRoute(
      region,
      site,
      bucketDomain.domain,
    )
    this.logger.debug(`create website route: `, route)

    // update phase to `Created`
    const updated = await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .updateOne(
        {
          _id: site._id,
          phase: DomainPhase.Creating,
        },
        {
          $set: {
            phase: DomainPhase.Created,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
      )

    if (updated.modifiedCount !== 1) {
      this.logger.error(`update website hosting phase failed: ${site._id}`)
    }
  }

  /**
   * Phase `Deleting`:
   * - delete website route
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<WebsiteHosting>('WebsiteHosting')
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
    const site = res.value
    const region = await this.regionService.findByAppId(site.appid)
    assert(region, 'region not found')

    // delete website route
    const route = await this.apisixService.deleteWebsiteRoute(region, site)

    this.logger.debug(`delete website route: `, route)

    // update phase to `Deleted`
    const updated = await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .updateOne(
        {
          _id: site._id,
          phase: DomainPhase.Deleting,
        },
        {
          $set: {
            phase: DomainPhase.Deleted,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
      )

    if (updated.modifiedCount > 1) {
      this.logger.error(`update website hosting phase failed: ${site._id}`)
    }
  }

  /**
   * State `Inactive`:
   * - move phase `Created` to `Deleting`
   */
  async handleInactiveState() {
    const db = SystemDatabase.db

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
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
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const db = SystemDatabase.db

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
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
   * State `Deleted`:
   * - move phase `Created` to `Deleting`
   * - delete `Deleted` documents
   */
  async handleDeletedState() {
    const db = SystemDatabase.db

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
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

    await db.collection<WebsiteHosting>('WebsiteHosting').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }

  /**
   * Clear timeout locks
   */
  async clearTimeoutLocks() {
    const db = SystemDatabase.db
    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
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
