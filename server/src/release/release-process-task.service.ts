import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { template } from 'lodash'
import {
  Application,
  ApplicationPhase,
  ApplicationState,
} from 'src/application/entities/application'
import { NotificationService } from 'src/notification/notification.service'
import { SystemDatabase } from 'src/system-database'
import { ReleaseService } from './release.service'
import { ReleaseConfig } from './entities/release-config'
import { UserService } from 'src/user/user.service'
import { ServerConfig } from 'src/constants'

@Injectable()
export class ReleaseProcessTaskService {
  private readonly logger = new Logger(ReleaseProcessTaskService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly noticationService: NotificationService,
    private readonly releaseService: ReleaseService,
    private readonly userService: UserService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (ServerConfig.DISABLED_RELEASE_PROCESS_TASK) return

    this.handleRealeasingState().catch((err) => {
      this.logger.error('handleReleasingState error', err)
    })
  }

  async handleRealeasingState() {
    const apps = await this.db
      .collection<Application>('Application')
      .find({
        state: ApplicationState.Releasing,
        phase: ApplicationPhase.Stopped,
      })
      .toArray()

    if (apps.length === 0) {
      this.logger.debug('no releasing application')
      return
    }

    const config = await this.releaseService.getReleaseConfig()
    if (!config.enableRelease) {
      this.logger.debug('skip releasing application')
      return
    }
    for (const app of apps) {
      this.handleReleaseApplication(app, config).catch((err) => {
        this.logger.error(`handleReleaseApplication ${app.appid} error`, err)
      })
    }
  }

  async handleReleaseApplication(app: Application, config: ReleaseConfig) {
    const { enableNotification, notificationProviders, stages } = config

    if (notificationProviders.length === 0) return

    // sort by minutesElapsed desc
    stages.sort((a, b) => b.minutesElapsed - a.minutesElapsed)

    const startTime = app.forceStoppedAt
    const endTime = new Date()
    const diff = endTime.getTime() - startTime.getTime()
    const diffMinutes = Math.floor(diff / 60 / 1000)

    // variables for notification template
    let remainingTimeInMinutes = stages[0].minutesElapsed - diffMinutes
    if (remainingTimeInMinutes < 0) remainingTimeInMinutes = 0
    const remainingTimeInDays = (remainingTimeInMinutes / 60 / 24).toFixed(1)
    const remainingTimeInHours = (remainingTimeInMinutes / 60).toFixed(1)

    let releaseTime = startTime.getTime() + stages[0].minutesElapsed * 60 * 1000
    const now = new Date().getTime()
    if (now > releaseTime) {
      releaseTime = now
    }
    const releaseTimeStr = new Date(releaseTime).toLocaleString()
    //

    const user = await this.userService.findOneById(app.createdBy)

    for (const [idx, item] of stages.entries()) {
      if (diffMinutes < item.minutesElapsed) continue

      if (enableNotification) {
        const _template = template(item.notificationTemplate)
        const payload = {
          appid: app.appid,
          appName: app.name,
          releaseTime: releaseTimeStr,
          remainingTimeInDays,
          remainingTimeInHours,
          remainingTimeInMinutes,
        }
        const text = _template(payload)

        notificationProviders.forEach((type) => {
          this.noticationService
            .send(type, text, user, payload)
            .catch((err) => {
              this.logger.error(
                `${app.appid} send release notification ${type} error`,
                err,
              )
            })
        })
      }

      // release
      if (idx === 0) {
        await this.releaseApplication(app)
      }
      break
    }
  }

  async releaseApplication(app: Application) {
    await this.db.collection<Application>('Application').updateOne(
      {
        _id: app._id,
      },
      {
        $set: {
          state: ApplicationState.Deleted,
          updatedAt: new Date(),
        },
      },
    )
  }
}
