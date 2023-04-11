import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  BucketDomain,
  DomainPhase,
  DomainState,
  WebsiteHosting,
} from '@prisma/client'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { RegionService } from 'src/region/region.service'
import * as assert from 'node:assert'
import { ApisixService } from './apisix.service'
import { ApisixCustomCertService } from './apisix-custom-cert.service'
import { ObjectId } from 'mongodb'
import { isConditionTrue } from 'src/utils/getter'

@Injectable()
export class WebsiteTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 1 // concurrency count
  private readonly logger = new Logger(WebsiteTaskService.name)

  constructor(
    private readonly regionService: RegionService,
    private readonly apisixService: ApisixService,
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
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
      )

    if (!res.value) return

    this.logger.debug(res.value)
    // get region by appid
    const site = {
      ...res.value,
      id: res.value._id.toString(),
    }
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

    // create website route if not exists
    const route = await this.apisixService.getRoute(region, site._id.toString())
    if (!route) {
      const res = await this.apisixService.createWebsiteRoute(
        region,
        site,
        bucketDomain.domain,
      )
      this.logger.log(`create website route: ${site._id}`)
      this.logger.debug(res)
    }

    // create website custom certificate if custom domain is set
    if (site.isCustom) {
      const waitingTime = Date.now() - site.updatedAt.getTime()

      // create custom domain  certificate
      let cert = await this.certService.readWebsiteDomainCert(region, site)
      if (!cert) {
        cert = await this.certService.createWebsiteDomainCert(region, site)
        this.logger.log(`create website cert: ${site._id}`)
        // return to wait for cert to be ready
        return await this.relock(site._id, waitingTime)
      }

      // check if cert status is Ready
      const conditions = (cert as any).status?.conditions || []
      if (!isConditionTrue('Ready', conditions)) {
        this.logger.log(`website cert is not ready: ${site._id}`)
        // return to wait for cert to be ready
        return await this.relock(site._id, waitingTime)
      }

      // config custom domain certificate to apisix
      let apisixTls = await this.certService.readWebsiteApisixTls(region, site)
      if (!apisixTls) {
        apisixTls = await this.certService.createWebsiteApisixTls(region, site)
        this.logger.log(`create website apisix tls: ${site._id}`)
        // return to wait for tls config to be ready
        return await this.relock(site._id, waitingTime)
      }

      // check if apisix tls status is Ready
      const apisixTlsConditions = (apisixTls as any).status?.conditions || []
      if (!isConditionTrue('ResourcesAvailable', apisixTlsConditions)) {
        this.logger.log(`website apisix tls is not ready: ${site._id}`)
        // return to wait for tls config to be ready
        return await this.relock(site._id, waitingTime)
      }
    }

    // update phase to `Created`
    await db.collection<WebsiteHosting>('WebsiteHosting').updateOne(
      { _id: site._id, phase: DomainPhase.Creating },
      {
        $set: {
          phase: DomainPhase.Created,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
      },
    )

    this.logger.log(`update website phase to 'Created': ${site._id}`)
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
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
      )

    if (!res.value) return

    // get region by appid
    const site = {
      ...res.value,
      id: res.value._id.toString(),
    }
    const region = await this.regionService.findByAppId(site.appid)
    assert(region, 'region not found')

    // delete website route if exists
    const route = await this.apisixService.getRoute(region, site._id.toString())
    if (route) {
      const res = await this.apisixService.deleteWebsiteRoute(region, site)
      this.logger.log(`delete website route: ${res?.key}`)
      this.logger.debug('delete website route', res)
    }
    // delete website custom certificate if custom domain is set
    if (site.isCustom) {
      const waitingTime = Date.now() - site.updatedAt.getTime()

      // delete custom domain certificate
      const cert = await this.certService.readWebsiteDomainCert(region, site)
      if (cert) {
        await this.certService.deleteWebsiteDomainCert(region, site)
        this.logger.log(`delete website cert: ${site._id}`)
        // return to wait for cert to be deleted
        return await this.relock(site._id, waitingTime)
      }

      // delete custom domain tls config from apisix
      const tls = await this.certService.readWebsiteApisixTls(region, site)
      if (tls) {
        await this.certService.deleteWebsiteApisixTls(region, site)
        this.logger.log(`delete website apisix tls: ${site._id}`)
        // return to wait for tls config to be deleted
        return this.relock(site._id, waitingTime)
      }
    }

    // update phase to `Deleted`
    await db.collection<WebsiteHosting>('WebsiteHosting').updateOne(
      { _id: site._id, phase: DomainPhase.Deleting },
      {
        $set: {
          phase: DomainPhase.Deleted,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
      },
    )

    this.logger.log(`update website phase to 'Deleted': ${site._id}`)
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
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const db = SystemDatabase.db

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
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

    await db.collection<WebsiteHosting>('WebsiteHosting').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }

  /**
   * Relock application by appid, lockedTime is in milliseconds
   */
  async relock(id: ObjectId, lockedTime = 0) {
    const db = SystemDatabase.db
    const lockedAt = new Date(Date.now() - 1000 * this.lockTimeout + lockedTime)
    await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .updateOne({ _id: id }, { $set: { lockedAt } })
  }
}
