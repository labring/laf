import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Application, ApplicationPhase, ApplicationState } from '@prisma/client'
import { isConditionTrue } from '../utils/getter'
import { InstanceService } from './instance.service'
import { times } from 'lodash'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { ClusterService } from 'src/region/cluster/cluster.service'

@Injectable()
export class InstanceTaskService {
  readonly lockTimeout = 60 // in second
  readonly concurrency = 1 // concurrency count
  private readonly logger = new Logger(InstanceTaskService.name)

  constructor(
    private readonly clusterService: ClusterService,
    private readonly instanceService: InstanceService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_INSTANCE_TASK) {
      return
    }

    // Phase `Created` | `Stopped` ->  `Starting`
    times(this.concurrency, () => this.handleRunningState())

    // Phase `Starting` -> `Started`
    times(this.concurrency, () => this.handleStartingPhase())

    // Phase `Started` -> `Stopping`
    times(this.concurrency, () => this.handleStoppedState())

    // Phase `Stopping` -> `Stopped`
    times(this.concurrency, () => this.handleStoppingPhase())

    // Phase `Started` -> `Stopping`
    times(this.concurrency, () => this.handleRestartingStateDown())

    // Phase `Stopped` -> `Starting`
    times(this.concurrency, () => this.handleRestartingStateUp())

    // Clear timeout locks
    this.clearTimeoutLocks()
  }

  /**
   * State `Running`:
   * - create instance
   * - move phase `Created` or `Stopped` to `Starting`
   */
  async handleRunningState() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          state: ApplicationState.Running,
          phase: {
            $in: [ApplicationPhase.Created, ApplicationPhase.Stopped],
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

    if (!res.value) return
    const app = res.value

    try {
      // create instance
      await this.instanceService.create(app)

      // update phase to `Starting`
      const updated = await db.collection<Application>('Application').updateOne(
        {
          appid: app.appid,
          phase: {
            $in: [ApplicationPhase.Created, ApplicationPhase.Stopped],
          },
        },
        {
          $set: {
            phase: ApplicationPhase.Starting,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
      )

      if (updated.modifiedCount > 0)
        this.logger.log(`Application ${app.appid} updated to phase starting`)
    } catch (error) {
      this.logger.error(error, error.response?.body)
    }
  }

  /**
   * Phase `Starting`:
   * - waiting for instance to be available
   * - move phase to `Started`
   */
  async handleStartingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          phase: ApplicationPhase.Starting,
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

    if (!res.value) return
    const app = res.value

    try {
      const appid = app.appid
      const instance = await this.instanceService.get(app)
      const available = isConditionTrue(
        'Available',
        instance.deployment.status?.conditions,
      )
      if (!available) {
        await this.unlock(appid)
        return
      }

      if (!instance.service) {
        await this.unlock(appid)
        return
      }

      // if state is `Restarting`, update state to `Running` with phase `Started`
      let toState = app.state
      if (app.state === ApplicationState.Restarting) {
        toState = ApplicationState.Running
      }

      // update application state
      const updated = await db.collection<Application>('Application').updateOne(
        {
          appid,
          phase: ApplicationPhase.Starting,
        },
        {
          $set: {
            state: toState,
            phase: ApplicationPhase.Started,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
      )

      if (updated.modifiedCount > 0)
        this.logger.debug(`Application ${app.appid} updated to phase started`)
    } catch (error) {
      this.logger.error(error)
    }
  }

  /**
   * State `Stopped`:
   * - remove instance
   * - move phase `Started` to `Stopping`
   */
  async handleStoppedState() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          state: ApplicationState.Stopped,
          phase: ApplicationPhase.Started,
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

    if (!res.value) return
    const app = res.value

    try {
      // remove instance
      await this.instanceService.remove(app)

      // update phase to `Stopping`
      const updated = await db.collection<Application>('Application').updateOne(
        {
          appid: app.appid,
          phase: ApplicationPhase.Started,
        },
        {
          $set: {
            phase: ApplicationPhase.Stopping,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
      )

      if (updated.modifiedCount > 0)
        this.logger.debug(`Application ${app.appid} updated to phase stopping`)
    } catch (error) {
      this.logger.error(error)
    }
  }

  /**
   * Phase `Stopping`:
   * - waiting for instance to be removed
   * - move phase `Stopping` to `Stopped`
   */
  async handleStoppingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          phase: ApplicationPhase.Stopping,
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

    if (!res.value) return
    const app = res.value
    const appid = app.appid

    try {
      // check if the instance is removed
      const instance = await this.instanceService.get(app)
      if (instance.deployment) {
        await this.unlock(appid)
        return
      }

      // update application phase to `Stopped`
      const updated = await db.collection<Application>('Application').updateOne(
        {
          appid,
          phase: ApplicationPhase.Stopping,
        },
        {
          $set: {
            phase: ApplicationPhase.Stopped,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
      )

      if (updated.modifiedCount > 0)
        this.logger.debug(`Application ${app.appid} updated to phase stopped`)
    } catch (error) {
      this.logger.error(error)
    }
  }

  /**
   * State `Restarting`:
   * - remove instance
   * - move phase `Started` to `Stopping`
   */
  async handleRestartingStateDown() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          state: ApplicationState.Restarting,
          phase: ApplicationPhase.Started,
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

    if (!res.value) return
    const app = res.value

    try {
      // remove instance
      await this.instanceService.remove(app)

      // update phase to `Stopping`
      const updated = await db.collection<Application>('Application').updateOne(
        {
          appid: app.appid,
          phase: ApplicationPhase.Started,
        },
        {
          $set: {
            phase: ApplicationPhase.Stopping,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
      )

      if (updated.modifiedCount > 0)
        this.logger.debug(`${app.appid} updated to stopping for restarting`)
    } catch (error) {
      this.logger.error(error)
    }
  }

  /**
   * State `Restarting`:
   * - create instance
   * - move phase `Stopped` to `Starting`
   */
  async handleRestartingStateUp() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          state: ApplicationState.Restarting,
          phase: ApplicationPhase.Stopped,
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

    if (!res.value) return
    const app = res.value

    try {
      // create instance
      await this.instanceService.create(app)

      // update phase to `Starting`
      const updated = await db.collection<Application>('Application').updateOne(
        {
          appid: app.appid,
          phase: ApplicationPhase.Stopped,
        },
        {
          $set: {
            phase: ApplicationPhase.Starting,
            lockedAt: TASK_LOCK_INIT_TIME,
          },
        },
      )

      if (updated.modifiedCount > 0)
        this.logger.debug(`${app.appid} updated starting for restarting`)
    } catch (error) {
      this.logger.error(error)
    }
  }

  /**
   * Unlock application by appid
   */
  async unlock(appid: string) {
    const db = SystemDatabase.db
    const updated = await db.collection<Application>('Application').updateOne(
      {
        appid: appid,
      },
      {
        $set: {
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  /**
   * Clear timeout locks
   */
  async clearTimeoutLocks() {
    const db = SystemDatabase.db

    await db.collection<Application>('Application').updateMany(
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
