import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ApplicationPhase, ApplicationState } from '@prisma/client'
import { isConditionTrue } from '../utils/getter'
import { PrismaService } from '../prisma.service'
import { InstanceService } from './instance.service'

@Injectable()
export class InstanceTaskService {
  private readonly logger = new Logger(InstanceTaskService.name)

  constructor(
    private readonly instanceService: InstanceService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * State `Running` with phase `Created` or `Stopped` - create instance
   *
   * -> Phase `Starting`
   */
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
        await this.instanceService.create(app)

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

  /**
   * Phase `Starting` - waiting for instance to be available
   *
   * -> Phase `Started`
   */
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
        const instance = await this.instanceService.get(app)
        const available = isConditionTrue(
          'Available',
          instance.deployment.status?.conditions,
        )
        if (!available) continue

        if (!instance.service) continue

        // if state is `Restarting`, update state to `Running` with phase `Started`
        let toState = app.state
        if (app.state === ApplicationState.Restarting) {
          toState = ApplicationState.Running
        }

        // update application state
        await this.prisma.application.updateMany({
          where: {
            appid,
            phase: ApplicationPhase.Starting,
          },
          data: {
            state: toState,
            phase: ApplicationPhase.Started,
          },
        })
        this.logger.debug(`Application ${app.appid} updated to phase started`)
      } catch (error) {
        this.logger.error(error)
      }
    }
  }

  /**
   * State `Stopped` with phase `Started` - remove instance
   *
   * -> Phase `Stopping`
   */
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
        await this.instanceService.remove(app)

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

  /**
   * Phase `Stopping` - waiting for deployment to be removed.
   *
   * -> Phase `Stopped`
   */
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
        const instance = await this.instanceService.get(app)
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

  /**
   * State `Restarting` with phase `Started` - remove instance
   *
   * -> Phase `Stopping`
   */
  @Cron(CronExpression.EVERY_SECOND)
  async handlePreparedRestart() {
    const apps = await this.prisma.application.findMany({
      where: {
        state: ApplicationState.Restarting,
        phase: ApplicationPhase.Started,
      },
      take: 5,
    })

    for (const app of apps) {
      try {
        await this.instanceService.remove(app)

        await this.prisma.application.updateMany({
          where: {
            appid: app.appid,
            state: ApplicationState.Restarting,
            phase: ApplicationPhase.Started,
          },
          data: {
            phase: ApplicationPhase.Stopping,
          },
        })

        this.logger.debug(
          `Application ${app.appid} updated to phase stopping for restart`,
        )
      } catch (error) {
        this.logger.error(error)
      }
    }
  }

  /**
   * State `Restarting` with phase `Stopped` - create instance
   *
   * -> Phase `Starting`
   */
  @Cron(CronExpression.EVERY_SECOND)
  async handleRestarting() {
    const apps = await this.prisma.application.findMany({
      where: {
        state: ApplicationState.Restarting,
        phase: ApplicationPhase.Stopped,
      },
      take: 5,
    })

    for (const app of apps) {
      try {
        await this.instanceService.create(app)

        await this.prisma.application.updateMany({
          where: {
            appid: app.appid,
            state: ApplicationState.Restarting,
            phase: ApplicationPhase.Stopped,
          },
          data: {
            phase: ApplicationPhase.Starting,
          },
        })

        this.logger.debug(
          `Application ${app.appid} updated to phase starting for restart`,
        )
      } catch (error) {
        this.logger.error(error)
      }
    }
  }
}
