import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  CN_PUBLISHED_WEBSITE_HOSTING,
  ServerConfig,
  TASK_LOCK_INIT_TIME,
} from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import { RegionService } from 'src/region/region.service'
import * as assert from 'node:assert'
import { CertificateService } from './certificate.service'
import { ObjectId } from 'mongodb'
import { isConditionTrue } from 'src/utils/getter'
import { WebsiteHosting } from 'src/website/entities/website'
import { DomainPhase, DomainState } from './entities/runtime-domain'
import { BucketDomain } from './entities/bucket-domain'
import { WebsiteHostingGatewayService } from './ingress/website-ingress.service'
import { DatabaseService } from 'src/database/database.service'
import { DedicatedDatabaseService } from 'src/database/dedicated-database/dedicated-database.service'

@Injectable()
export class WebsiteTaskService {
  readonly lockTimeout = 30 // in second
  private readonly logger = new Logger(WebsiteTaskService.name)

  constructor(
    private readonly regionService: RegionService,
    private readonly websiteGateway: WebsiteHostingGatewayService,
    private readonly certService: CertificateService,
    private readonly databaseService: DatabaseService,
    private readonly dedicatedDatabaseService: DedicatedDatabaseService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_GATEWAY_TASK) return

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
        { returnDocument: 'after' },
      )

    if (!res.value) return

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

    assert(bucketDomain, `bucket domain not found: ${site.bucketName}`)

    // create website custom certificate if custom domain is set
    // Warning: create certificate before ingress, otherwise apisix ingress will not work
    if (site.isCustom && region.gatewayConf.tls.enabled) {
      const waitingTime = Date.now() - site.updatedAt.getTime()

      // create custom domain  certificate
      let cert = await this.certService.getWebsiteCertificate(region, site)
      if (!cert) {
        cert = await this.certService.createWebsiteCertificate(region, site)
        this.logger.log(`create website domain certificate: ${site.domain}`)
        // return to wait for cert to be ready
        return await this.relock(site._id, waitingTime)
      }

      // check if cert status is Ready
      const conditions = (cert as any).status?.conditions || []
      if (!isConditionTrue('Ready', conditions)) {
        this.logger.log(`website certificate is not ready: ${site.domain}`)
        // return to wait for cert to be ready
        return await this.relock(site._id, waitingTime)
      }
    }

    // create website route if not exists
    const ingress = await this.websiteGateway.getIngress(region, site)
    if (!ingress) {
      await this.websiteGateway.createIngress(region, site)
      this.logger.log(`create website ingress: ${site.domain}`)
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

    await this.publish(site)

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
        { returnDocument: 'after' },
      )

    if (!res.value) return

    // get region by appid
    const site = res.value
    const region = await this.regionService.findByAppId(site.appid)
    assert(region, 'region not found')

    // delete website ingress if exists
    const ingress = await this.websiteGateway.getIngress(region, site)
    if (ingress) {
      await this.websiteGateway.deleteIngress(region, site)
      this.logger.log(`delete website ingress: ${site.domain}`)
    }

    // delete website custom certificate if custom domain is set

    /* Certificates are only removed when you delete the application and unbind the custom runtime domain.
    Starting, restarting and stopping the application does not remove certificates */
    if (
      (site.state === DomainState.Deleted && site.isCustom) ||
      (site.state === DomainState.Active && site.phase === DomainPhase.Deleting)
    ) {
      const waitingTime = Date.now() - site.updatedAt.getTime()

      // delete custom domain certificate
      const cert = await this.certService.getWebsiteCertificate(region, site)
      if (cert) {
        await this.certService.deleteWebsiteCertificate(region, site)
        this.logger.log(`delete website domain certificate: ${site.domain}`)
        // return to wait for cert to be deleted
        return await this.relock(site._id, waitingTime)
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

    await this.unpublish(site)

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

    await db.collection<WebsiteHosting>('WebsiteHosting').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }

  /**
   * Relock application by appid, lockedTime is in milliseconds
   */
  async relock(id: ObjectId, lockedTime = 0) {
    if (lockedTime <= 2 * 60 * 1000) {
      lockedTime = Math.ceil(lockedTime / 10)
    }

    if (lockedTime > 2 * 60 * 1000) {
      lockedTime = this.lockTimeout * 1000
    }

    const db = SystemDatabase.db
    const lockedAt = new Date(Date.now() - 1000 * this.lockTimeout + lockedTime)
    await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .updateOne({ _id: id }, { $set: { lockedAt } })
  }

  async publish(website: WebsiteHosting) {
    const { db, client } =
      (await this.dedicatedDatabaseService.findAndConnect(website.appid)) ||
      (await this.databaseService.findAndConnect(website.appid))
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_WEBSITE_HOSTING)

        await coll.deleteMany({ bucketName: website.bucketName }, { session })
        await coll.insertOne(website, { session })
      })
    } finally {
      await session.endSession()
      await client.close()
    }
  }

  async unpublish(website: WebsiteHosting) {
    const { db, client } =
      (await this.dedicatedDatabaseService.findAndConnect(website.appid)) ||
      (await this.databaseService.findAndConnect(website.appid))

    try {
      const coll = db.collection(CN_PUBLISHED_WEBSITE_HOSTING)
      await coll.deleteMany({ bucketName: website.bucketName })
    } finally {
      await client.close()
    }
  }
}
