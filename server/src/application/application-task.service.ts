import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Application, ApplicationPhase, Region } from '@prisma/client'
import { isConditionTrue } from '../utils/getter'
import { DatabaseCoreService } from '../core/database.cr.service'
import { GatewayCoreService } from '../core/gateway.cr.service'
import { PrismaService } from '../prisma.service'
import * as assert from 'node:assert'
import { ApplicationCoreService } from '../core/application.cr.service'
import { StorageService } from 'src/storage/storage.service'

@Injectable()
export class ApplicationTaskService {
  private readonly logger = new Logger(ApplicationTaskService.name)

  constructor(
    private readonly appCore: ApplicationCoreService,
    private readonly databaseCore: DatabaseCoreService,
    private readonly gatewayCore: GatewayCoreService,
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Process application in `Creating` phase
   */
  @Cron(CronExpression.EVERY_SECOND)
  async handleCreatingPhase() {
    const apps = await this.prisma.application.findMany({
      where: {
        phase: ApplicationPhase.Creating,
      },
      take: 20,
    })

    for (const app of apps) {
      this.reconcileCreatingPhase(app).catch((error) => {
        this.logger.error(error)
      })
    }
  }

  /**
   * Process application in `Deleting` phase
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleDeletingPhase() {
    const apps = await this.prisma.application.findMany({
      where: {
        phase: ApplicationPhase.Deleting,
      },
      take: 2,
    })

    for (const app of apps) {
      this.reconcileDeletingPhase(app).catch((error) => {
        this.logger.error(error)
      })
    }
  }

  /**
   * Reconcile phase of application from `Creating` to `Created`
   * @param app
   * @returns
   */
  private async reconcileCreatingPhase(app: Application) {
    const appid = app.appid
    // get app bundle
    const bundle = await this.prisma.bundle.findUnique({
      where: {
        regionName_name: {
          regionName: app.regionName,
          name: app.bundleName,
        },
      },
    })
    assert(bundle, `Bundle ${app.bundleName} not found`)

    // get app region
    const region = await this.prisma.region.findUnique({
      where: {
        name: app.regionName,
      },
    })

    // reconcile resources
    const namespace = await this.appCore.getAppNamespace(appid)
    if (!namespace) {
      this.logger.debug(`Creating namespace for application ${appid}`)
      await this.appCore.createAppNamespace(appid, app.createdBy)
      return
    }

    let storage = await this.storageService.findOne(appid)
    if (!storage) {
      this.logger.debug(`Creating storage for application ${appid}`)
      const res = await this.storageService.create(app, region)
      if (res) {
        storage = res
      }
    }

    let database = await this.databaseCore.findOne(appid)
    if (!database) {
      this.logger.debug(`Creating database for application ${appid}`)
      database = await this.databaseCore.create(app, bundle)
    }

    let gateway = await this.gatewayCore.findOne(appid)
    if (!gateway) {
      this.logger.debug(`Creating gateway for application ${appid}`)
      gateway = await this.gatewayCore.create(app.appid)
    }

    // reconcile state
    if (!isConditionTrue('Ready', database?.status?.conditions)) return
    if (!isConditionTrue('Ready', gateway?.status?.conditions)) return
    if (!storage) return

    // update phase
    await this.prisma.application.updateMany({
      where: {
        appid: app.appid,
        phase: ApplicationPhase.Creating,
      },
      data: {
        phase: ApplicationPhase.Created,
      },
    })
    this.logger.log(`Application ${app.appid} updated to phase created`)
  }

  /**
   * Reconcile phase of application from `Deleting` to `Deleted`
   * @param app
   * @returns
   */
  private async reconcileDeletingPhase(app: Application) {
    const appid = app.appid

    // delete namespace
    const namespace = await this.appCore.getAppNamespace(appid)
    if (namespace) {
      await this.appCore.removeAppNamespace(appid)
      return
    }

    // update phase
    await this.prisma.application.updateMany({
      where: {
        appid,
        phase: ApplicationPhase.Deleting,
      },
      data: {
        phase: ApplicationPhase.Deleted,
      },
    })
    this.logger.log(`Application ${app.appid} updated to phase deleted`)
  }
}
