import { Injectable, Logger } from '@nestjs/common'
import { RegionService } from '../region/region.service'
import { ApisixService } from './apisix.service'
import * as assert from 'node:assert'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ServerConfig, TASK_LOCK_INIT_TIME } from '../constants'
import { SystemDatabase } from '../system-database'
import {
  DomainPhase,
  DomainState,
  RuntimeDomain,
} from './entities/runtime-domain'
import { ApisixCustomCertService } from './apisix-custom-cert.service'
import { isConditionTrue } from 'src/utils/getter'

@Injectable()
export class RuntimeDomainTaskService {
  readonly lockTimeout = 30 // in second
  private readonly logger = new Logger(RuntimeDomainTaskService.name)

  constructor(
    private readonly apisixService: ApisixService,
    private readonly regionService: RegionService,
    private readonly certService: ApisixCustomCertService,
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
        { returnDocument: 'after' },
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

    // custom domain
    if (doc.customDomain) {
      const id = `app-custom-${doc.appid}`
      const route = await this.apisixService.getRoute(region, id)
      if (!route) {
        await this.apisixService.createAppCustomRoute(region, doc)
        this.logger.log('app custom route created: ' + doc.appid)
        this.logger.debug(route)
      }

      {
        // create custom certificate if custom domain is set
        const waitingTime = Date.now() - doc.updatedAt.getTime()

        // create custom domain certificate
        let cert = await this.certService.readAppCustomDomainCert(region, doc)
        if (!cert) {
          cert = await this.certService.createAppCustomDomainCert(region, doc)
          this.logger.log(`create app custom domain cert: ${doc.appid}`)
          // return to wait for cert to be ready
          return await this.relock(doc.appid, waitingTime)
        }

        // check if cert status is Ready
        const conditions = (cert as any).status?.conditions || []
        if (!isConditionTrue('Ready', conditions)) {
          this.logger.log(`app custom domain cert is not ready: ${doc.appid}`)
          // return to wait for cert to be ready
          return await this.relock(doc.appid, waitingTime)
        }

        // config custom domain certificate to apisix
        let apisixTls = await this.certService.readAppCustomDomainApisixTls(
          region,
          doc,
        )
        if (!apisixTls) {
          apisixTls = await this.certService.createAppCustomDomainApisixTls(
            region,
            doc,
          )
          this.logger.log(`create app custom domain apisix tls: ${doc.appid}`)
          // return to wait for tls config to be ready
          return await this.relock(doc.appid, waitingTime)
        }

        // check if apisix tls status is Ready
        const apisixTlsConditions = (apisixTls as any).status?.conditions || []
        if (!isConditionTrue('ResourcesAvailable', apisixTlsConditions)) {
          this.logger.log(`website apisix tls is not ready: ${doc.appid}`)
          // return to wait for tls config to be ready
          return await this.relock(doc.appid, waitingTime)
        }
      }
    }

    // update phase to `Created`
    await db.collection<RuntimeDomain>('RuntimeDomain').updateOne(
      { _id: doc._id, phase: DomainPhase.Creating },
      {
        $set: {
          phase: DomainPhase.Created,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
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
        { returnDocument: 'after' },
      )
    if (!res.value) return

    // get region by appid
    const doc = res.value
    const region = await this.regionService.findByAppId(doc.appid)
    assert(region, 'region not found')

    // delete route first if exists
    {
      const id = `app-${doc.appid}`
      const route = await this.apisixService.getRoute(region, id)
      if (route) {
        await this.apisixService.deleteAppRoute(region, doc.appid)
        this.logger.log('app route deleted: ' + doc.appid)
        this.logger.debug(route)
      }
    }

    {
      const id = `app-custom-${doc.appid}`
      const route = await this.apisixService.getRoute(region, id)
      if (route) {
        await this.apisixService.deleteAppCustomRoute(region, doc.appid)
        this.logger.log('app custom route deleted: ' + doc.appid)
        this.logger.debug(route)
      }

      // delete app custom certificate if custom domain is set
      const waitingTime = Date.now() - doc.updatedAt.getTime()

      // delete custom domain certificate
      const cert = await this.certService.readAppCustomDomainCert(region, doc)
      if (cert) {
        await this.certService.deleteAppCustomDomainCert(region, doc)
        this.logger.log(`delete app custom domain cert: ${doc.appid}`)
        // return to wait for cert to be deleted
        return await this.relock(doc.appid, waitingTime)
      }

      // delete custom domain tls config from apisix
      const tls = await this.certService.readAppCustomDomainApisixTls(
        region,
        doc,
      )
      if (tls) {
        await this.certService.deleteAppCustomDomainApisixTls(region, doc)
        this.logger.log(`delete app custom domain tls: ${doc.appid}`)
        // return to wait for tls config to be deleted
        return this.relock(doc.appid, waitingTime)
      }
    }

    // update phase to `Deleted`
    await db.collection<RuntimeDomain>('RuntimeDomain').updateOne(
      { _id: doc._id, phase: DomainPhase.Deleting },
      {
        $set: {
          phase: DomainPhase.Deleted,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
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
        $set: {
          phase: DomainPhase.Creating,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
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

    await db.collection<RuntimeDomain>('RuntimeDomain').updateMany(
      {
        state: DomainState.Inactive,
        phase: { $in: [DomainPhase.Created, DomainPhase.Creating] },
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
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

    await db.collection<RuntimeDomain>('RuntimeDomain').updateMany(
      {
        state: DomainState.Deleted,
        phase: { $in: [DomainPhase.Created, DomainPhase.Creating] },
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
      },
    )

    await db.collection<RuntimeDomain>('RuntimeDomain').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }

  /**
   * Relock application by appid, lockedTime is in milliseconds
   */
  async relock(appid: string, lockedTime = 0) {
    if (lockedTime <= 2 * 60 * 1000) {
      lockedTime = Math.ceil(lockedTime / 10)
    }

    if (lockedTime > 2 * 60 * 1000) {
      lockedTime = this.lockTimeout * 1000
    }

    const db = SystemDatabase.db
    const lockedAt = new Date(Date.now() - 1000 * this.lockTimeout + lockedTime)
    await db
      .collection<RuntimeDomain>('RuntimeDomain')
      .updateOne({ appid }, { $set: { lockedAt } })
  }
}
