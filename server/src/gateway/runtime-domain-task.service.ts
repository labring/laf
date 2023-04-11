import { Injectable, Logger } from '@nestjs/common'
import { RuntimeDomain, DomainPhase, DomainState } from '@prisma/client'
import { RegionService } from '../region/region.service'
import { ApisixService } from './apisix.service'
import * as assert from 'node:assert'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ServerConfig, TASK_LOCK_INIT_TIME } from '../constants'
import { SystemDatabase } from '../database/system-database'

@Injectable()
export class RuntimeDomainTaskService {
  readonly lockTimeout = 30 // in second
  private readonly logger = new Logger(RuntimeDomainTaskService.name)

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
   * - create route
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<RuntimeDomain>('RuntimeDomain')
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
    this.logger.log('handleCreatingPhase matched function domain ' + doc.appid)

    const region = await this.regionService.findByAppId(doc.appid)
    assert(region, 'region not found')

    // create route if not exists
    const id = `app-${doc.appid}`
    const route = await this.apisixService.getRoute(region, id)
    if (!route) {
      await this.apisixService.createAppRoute(region, doc.appid, doc.domain)
      this.logger.log('app route created: ' + doc.appid)
      this.logger.debug(route)
    }

    // update phase to `Created`
    await db.collection<RuntimeDomain>('RuntimeDomain').updateOne(
      { _id: doc._id, phase: DomainPhase.Creating },
      {
        $set: { phase: DomainPhase.Created, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    this.logger.log('app domain phase updated to Created ' + doc.domain)
  }

  /**
   * Phase `Deleting`:
   * - delete route
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<RuntimeDomain>('RuntimeDomain')
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

    // delete route first if exists
    const id = `app-${doc.appid}`
    const route = await this.apisixService.getRoute(region, id)
    if (route) {
      await this.apisixService.deleteAppRoute(region, doc.appid)
      this.logger.log('app route deleted: ' + doc.appid)
      this.logger.debug(route)
    }

    // update phase to `Deleted`
    await db.collection<RuntimeDomain>('RuntimeDomain').updateOne(
      { _id: doc._id, phase: DomainPhase.Deleting },
      {
        $set: { phase: DomainPhase.Deleted, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    this.logger.log('app domain phase updated to Deleted: ' + doc.appid)
  }

  /**
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const db = SystemDatabase.db

    await db.collection<RuntimeDomain>('RuntimeDomain').updateMany(
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

    await db.collection<RuntimeDomain>('RuntimeDomain').updateMany(
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

    await db.collection<RuntimeDomain>('RuntimeDomain').updateMany(
      {
        state: DomainState.Deleted,
        phase: DomainPhase.Created,
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: { phase: DomainPhase.Deleting, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    await db.collection<RuntimeDomain>('RuntimeDomain').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }
}
