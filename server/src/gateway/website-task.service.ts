import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  BucketDomain,
  DomainPhase,
  DomainState,
  WebsiteHosting,
} from '@prisma/client'
import { times } from 'lodash'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { RegionService } from 'src/region/region.service'
import * as assert from 'node:assert'
import { ApisixService } from './apisix.service'
import { ApisixCustomCertService } from './apisix-custom-cert.service'

@Injectable()
export class WebsiteTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 1 // concurrency count
  private readonly logger = new Logger(WebsiteTaskService.name)

  constructor(
    private readonly regionService: RegionService,
    private readonly apisixService: ApisixService,
    private readonly customCertService: ApisixCustomCertService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_GATEWAY_TASK) {
      return
    }

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

    // create website route
    const route = await this.apisixService.createWebsiteRoute(
      region,
      site,
      bucketDomain.domain,
    )
    this.logger.log(`create website route: ${route?.node?.key}`)

    // create website custom certificate if custom domain is set
    if (site.isCustom) {
      // create custom domain  certificate
      let cert = await this.customCertService.readWebsiteDomainCert(
        region,
        site,
      )
      if (!cert) {
        cert = await this.customCertService.createWebsiteDomainCert(
          region,
          site,
        )
        this.logger.log(`create website cert: ${site._id}`)
      }

      // return to try to create cert again in next tick if cert is not found
      if (!cert) {
        this.logger.error(`create website cert failed: ${site._id}`)
        return
      }

      // config custom domain certificate to apisix
      let apisixTls = await this.customCertService.readWebsiteDomainApisixTls(
        region,
        site,
      )
      if (!apisixTls) {
        apisixTls = await this.customCertService.createWebsiteDomainApisixTls(
          region,
          site,
        )
        this.logger.log(`create website apisix tls: ${site._id}`)
      }

      // return to try to create cert again in next tick if cert is not found
      if (!apisixTls) {
        this.logger.error(`create website apisix tls failed: ${site._id}`)
        return
      }
    }

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
      return
    }

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
      await this.apisixService.deleteWebsiteRoute(region, site)
      const res = await this.apisixService.deleteWebsiteRoute(region, site)
      this.logger.log(`delete website route: ${res?.key}`)
      this.logger.debug('delete website route', res)
    }
    // delete website custom certificate if custom domain is set
    if (site.isCustom) {
      // delete custom domain  certificate
      const cert = await this.customCertService.readWebsiteDomainCert(
        region,
        site,
      )
      if (cert) {
        await this.customCertService.deleteWebsiteDomainCert(region, site)
        this.logger.log(`delete website cert: ${site._id}`)
        // return to wait for cert to be deleted
        return
      }

      // delete custom domain certificate from apisix
      const apisixTls = await this.customCertService.readWebsiteDomainApisixTls(
        region,
        site,
      )
      if (apisixTls) {
        await this.customCertService.deleteWebsiteDomainApisixTls(region, site)
        this.logger.log(`delete website apisix tls: ${site._id}`)
        // return to wait for cert to be deleted
        return
      }
    }

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
      return
    }

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
