import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Application, ApplicationPhase } from '@prisma/client'
import { isConditionTrue } from 'src/common/getter'
import { DatabaseCoreService } from 'src/core/database.cr.service'
import { GatewayCoreService } from 'src/core/gateway.cr.service'
import { OSSUserCoreService } from 'src/core/oss-user.cr.service'
import { PrismaService } from 'src/prisma.service'
import * as assert from 'node:assert'
import { ApplicationCoreService } from 'src/core/application.cr.service'

@Injectable()
export class ApplicationTaskService {
  private readonly logger = new Logger(ApplicationTaskService.name)

  constructor(
    private readonly appCore: ApplicationCoreService,
    private readonly databaseCore: DatabaseCoreService,
    private readonly gatewayCore: GatewayCoreService,
    private readonly ossCore: OSSUserCoreService,
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
      where: { name: app.bundleName },
    })
    assert(bundle, `Bundle ${app.bundleName} not found`)

    // reconcile resources
    const namespace = await this.appCore.getAppNamespace(appid)
    if (!namespace) {
      await this.appCore.createAppNamespace(appid, app.createdBy)
      return
    }

    let database = await this.databaseCore.findOne(appid)
    let oss = await this.ossCore.findOne(appid)
    let gateway = await this.gatewayCore.findOne(appid)

    if (!database) database = await this.databaseCore.create(app, bundle)
    if (!oss) oss = await this.ossCore.create(app, bundle)
    if (!gateway) gateway = await this.gatewayCore.create(app.appid)

    // reconcile state
    if (!isConditionTrue('Ready', database?.status?.conditions)) return
    if (!isConditionTrue('Ready', gateway?.status?.conditions)) return
    if (!isConditionTrue('Ready', oss?.status?.conditions)) return

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
