import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ApplicationPhase, ApplicationState } from '@prisma/client'
import { isConditionTrue } from 'src/common/getter'
import { DatabaseCoreService } from 'src/core/database.cr.service'
import { GatewayCoreService } from 'src/core/gateway.cr.service'
import { OSSUserCoreService } from 'src/core/oss-user.cr.service'
import { PrismaService } from 'src/prisma.service'
import { InstanceService } from './instance.service'

@Injectable()
export class InstanceTaskService {
  private readonly logger = new Logger(InstanceTaskService.name)

  constructor(
    private readonly instanceService: InstanceService,
    private readonly databaseCore: DatabaseCoreService,
    private readonly gatewayCore: GatewayCoreService,
    private readonly ossCore: OSSUserCoreService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async handlePreparedStart() {
    const apps = await this.prisma.application.findMany({
      where: {
        state: ApplicationState.Running,
        phase: {
          in: [ApplicationPhase.Created, ApplicationPhase.Stopped],
        },
      },
      take: 5,
    })

    for (const app of apps) {
      try {
        const appid = app.appid
        await this.instanceService.create(appid)

        await this.prisma.application.updateMany({
          where: {
            appid: app.appid,
            state: ApplicationState.Running,
            phase: {
              in: [ApplicationPhase.Created, ApplicationPhase.Stopped],
            },
          },
          data: {
            phase: ApplicationPhase.Starting,
          },
        })

        this.logger.debug(`Application ${app.appid} updated to phase starting`)
      } catch (error) {
        this.logger.error(error, error.response?.body)
      }
    }
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleStarting() {
    const apps = await this.prisma.application.findMany({
      where: {
        phase: ApplicationPhase.Starting,
      },
      take: 5,
    })

    for (const app of apps) {
      try {
        const appid = app.appid
        const instance = await this.instanceService.get(appid)
        const available = isConditionTrue(
          'Available',
          instance.deployment.status?.conditions,
        )
        if (!available) continue

        if (!instance.service) continue

        // update application state
        await this.prisma.application.updateMany({
          where: {
            appid,
            phase: ApplicationPhase.Starting,
          },
          data: {
            phase: ApplicationPhase.Started,
          },
        })
      } catch (error) {
        this.logger.error(error)
      }
    }
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handlePreparedStop() {
    const apps = await this.prisma.application.findMany({
      where: {
        state: ApplicationState.Stopped,
        phase: ApplicationPhase.Started,
      },
      take: 5,
    })

    for (const app of apps) {
      try {
        const appid = app.appid
        await this.instanceService.remove(appid)

        await this.prisma.application.updateMany({
          where: {
            appid: app.appid,
            state: ApplicationState.Stopped,
            phase: ApplicationPhase.Started,
          },
          data: {
            phase: ApplicationPhase.Stopping,
          },
        })

        this.logger.debug(`Application ${app.appid} updated to phase stopping`)
      } catch (error) {
        this.logger.error(error)
      }
    }
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleStopping() {
    const apps = await this.prisma.application.findMany({
      where: {
        phase: ApplicationPhase.Stopping,
      },
      take: 5,
    })

    for (const app of apps) {
      try {
        const appid = app.appid
        const instance = await this.instanceService.get(appid)
        if (instance.deployment) continue

        // update application state
        await this.prisma.application.updateMany({
          where: {
            appid,
            phase: ApplicationPhase.Stopping,
          },
          data: {
            phase: ApplicationPhase.Stopped,
          },
        })
        this.logger.debug(`Application ${app.appid} updated to phase stopped`)
      } catch (error) {
        this.logger.error(error)
      }
    }
  }
}
