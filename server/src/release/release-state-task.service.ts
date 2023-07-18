import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  Application,
  ApplicationPhase,
  ApplicationState,
} from 'src/application/entities/application'
import { ServerConfig } from 'src/constants'
import { SystemDatabase } from 'src/system-database'

@Injectable()
export class ReleaseStateTaskService {
  private readonly db = SystemDatabase.db
  private readonly lockTimeout = 3 * 60 // in second
  private readonly logger = new Logger(ReleaseStateTaskService.name)

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (ServerConfig.DISABLED_RELEASE_STATE_TASK) return

    this.handleStateStoppedToReleasing().catch((err) => {
      this.logger.error('handleStateStoppedToReleasing error', err)
    })
    this.handleStateReleasingToRestarting().catch((err) => {
      this.logger.error('handleStateReleasingToRestarting error', err)
    })
  }

  async handleStateStoppedToReleasing() {
    const apps = await this.db
      .collection<Application>('Application')
      .find({
        state: ApplicationState.Stopped,
        phase: ApplicationPhase.Stopped,
        forceStoppedAt: {
          $gt: new Date(Date.now() - this.lockTimeout * 1000),
        },
      })
      .toArray()

    if (apps.length === 0) {
      this.logger.debug('No application need to be released')
      return
    }

    await this.db.collection<Application>('Application').updateMany(
      {
        _id: {
          $in: apps.map((app) => app._id),
        },
      },
      {
        $set: {
          state: ApplicationState.Releasing,
          updatedAt: new Date(),
        },
      },
    )

    this.logger.warn(
      'application state changed to Releasing',
      apps.map((v) => v.appid).join(' '),
    )
  }

  async handleStateReleasingToRestarting() {
    const apps = await this.db
      .collection<Application>('Application')
      .aggregate([
        {
          $match: {
            state: ApplicationState.Releasing,
          },
        },
        {
          $lookup: {
            from: 'Account',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'account',
          },
        },
        {
          $match: {
            'account.balance': {
              $gte: 0,
            },
          },
        },
        {
          $project: {
            _id: 1,
            appid: 1,
          },
        },
      ])
      .toArray()

    if (apps.length === 0) {
      this.logger.debug('No application need to cancel releasing')
      return
    }

    await this.db.collection<Application>('Application').updateMany(
      {
        _id: {
          $in: apps.map((app) => app._id),
        },
      },
      {
        $set: {
          state: ApplicationState.Restarting,
          updatedAt: new Date(),
        },
      },
    )

    this.logger.warn(
      'application cancel releasing',
      apps.map((v) => v.appid).join(' '),
    )
  }
}
