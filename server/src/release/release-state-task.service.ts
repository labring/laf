import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  Application,
  ApplicationPhase,
  ApplicationState,
} from 'src/application/entities/application'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import {
  ApplicationRelease,
  ApplicationReleasePhase,
} from './entities/application-release'
import { ObjectId } from 'mongodb'

@Injectable()
export class ReleaseStateTaskService {
  private readonly db = SystemDatabase.db
  private readonly lockTimeout = 15 // in second
  private readonly logger = new Logger(ReleaseStateTaskService.name)

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (ServerConfig.DISABLED_RELEASE_STATE_TASK) return

    this.handleStateStoppedToReleasing().catch((err) => {
      this.logger.error('Stopped -> Releasing error', err)
    })
    this.handleStateReleasingToRestarting().catch((err) => {
      this.logger.error('Releasing -> Restarting error', err)
    })
  }

  async handleStateStoppedToReleasing() {
    const res = await this.db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          state: ApplicationState.Stopped,
          phase: ApplicationPhase.Stopped,
          forceStoppedAt: {
            $exists: true,
          },
          lockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        {
          $set: {
            lockedAt: new Date(),
          },
        },
      )

    if (!res.value) {
      this.logger.debug('no application need to be released')
      return
    }
    const app = res.value

    const session = SystemDatabase.client.startSession()
    try {
      await session.withTransaction(async () => {
        await this.db.collection<Application>('Application').updateOne(
          app._id,
          {
            $set: {
              state: ApplicationState.Releasing,
              updatedAt: new Date(),
            },
          },
          { session },
        )

        await this.db
          .collection<ApplicationRelease>('ApplicationRelease')
          .insertOne(
            {
              appid: app.appid,
              name: app.name,
              createdBy: app.createdBy,
              createdAt: new Date(),
              updatedAt: new Date(),
              tickedAt: TASK_LOCK_INIT_TIME,
              lockedAt: TASK_LOCK_INIT_TIME,
              phase: ApplicationReleasePhase.Pending,
            },
            {
              session,
            },
          )
      })

      this.logger.warn(`application ${app.appid} state changed to Releasing`)
    } finally {
      await session.endSession()
      this.handleStateStoppedToReleasing().catch((err) => {
        this.logger.error('Stopped -> Releasing error', err)
      })
    }
  }

  async handleStateReleasingToRestarting() {
    const apps = await this.db
      .collection<ApplicationRelease>('ApplicationRelease')
      .aggregate([
        {
          $match: {
            phase: ApplicationReleasePhase.Pending,
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

    for (const app of apps) {
      this.handleStateReleasingToRestartingSingle(app._id).catch((err) => {
        this.logger.error(`${app.appid} Releasing -> Restarting error`, err)
      })
    }
  }

  async handleStateReleasingToRestartingSingle(id: ObjectId) {
    const res = await this.db
      .collection<ApplicationRelease>('ApplicationRelease')
      .findOneAndUpdate(
        {
          _id: id,
          lockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        {
          $set: {
            lockedAt: new Date(),
          },
        },
      )

    if (!res.value) {
      return
    }
    const app = res.value

    const session = SystemDatabase.client.startSession()
    try {
      await session.withTransaction(async () => {
        await this.db.collection<Application>('Application').updateOne(
          {
            appid: app.appid,
          },
          {
            $set: {
              state: ApplicationState.Restarting,
              updatedAt: new Date(),
            },
            $unset: {
              forceStoppedAt: '',
            },
          },
          {
            session,
          },
        )

        await this.db
          .collection<ApplicationRelease>('ApplicationRelease')
          .updateOne(
            app._id,
            {
              $set: {
                phase: ApplicationReleasePhase.Cancel,
                updatedAt: new Date(),
              },
            },
            {
              session,
            },
          )
        this.logger.warn(`application ${app.appid} cancel releasing`)
      })
    } finally {
      await session.endSession()
    }
  }
}
