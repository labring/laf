import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { isConditionTrue } from '../utils/getter'
import { InstanceService } from './instance.service'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import {
  Application,
  ApplicationPhase,
  ApplicationState,
} from 'src/application/entities/application'
import { DomainState, RuntimeDomain } from 'src/gateway/entities/runtime-domain'
import { BucketDomain } from 'src/gateway/entities/bucket-domain'
import { WebsiteHosting } from 'src/website/entities/website'
import { CronTrigger, TriggerState } from 'src/trigger/entities/cron-trigger'
import { DedicatedDatabaseService } from 'src/database/dedicated-database/dedicated-database.service'
import {
  DedicatedDatabasePhase,
  DedicatedDatabaseState,
} from 'src/database/entities/dedicated-database'

@Injectable()
export class InstanceTaskService {
  readonly lockTimeout = 15 // in second
  private readonly logger = new Logger(InstanceTaskService.name)

  constructor(
    private readonly instanceService: InstanceService,
    private readonly dedicatedDatabaseService: DedicatedDatabaseService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_INSTANCE_TASK) {
      return
    }

    // Phase `Created` | `Stopped` ->  `Starting`
    this.handleRunningState().catch((err) => {
      this.logger.error('handleRunningState error', err)
      this.logger.debug(err?.response?.toJSON() || JSON.stringify(err))
    })

    // Phase `Starting` -> `Started`
    this.handleStartingPhase().catch((err) => {
      this.logger.error('handleStartingPhase error', err)
      this.logger.debug(err?.response?.toJSON() || JSON.stringify(err))
    })

    // Phase `Started` -> `Stopping`
    this.handleStoppedState().catch((err) => {
      this.logger.error('handleStoppedState error', err)
      this.logger.debug(err?.response?.toJSON() || JSON.stringify(err))
    })

    // Phase `Stopping` -> `Stopped`
    this.handleStoppingPhase().catch((err) => {
      this.logger.error('handleStoppingPhase error', err)
      this.logger.debug(err?.response?.toJSON() || JSON.stringify(err))
    })

    // Phase `Started` -> `Starting`
    this.handleRestartingState().catch((err) => {
      this.logger.error('handleRestartingPhase error', err)
      this.logger.debug(err?.response?.toJSON() || JSON.stringify(err))
    })
  }

  /**
   * State `Running`:
   * - move phase `Created` or `Stopped` to `Starting`
   */
  async handleRunningState() {
    const db = SystemDatabase.db

    await db.collection<Application>('Application').updateMany(
      {
        state: ApplicationState.Running,
        phase: { $in: [ApplicationPhase.Created, ApplicationPhase.Stopped] },
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: {
          phase: ApplicationPhase.Starting,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
      },
    )
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
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
        { sort: { lockedAt: 1, updatedAt: 1 }, returnDocument: 'after' },
      )

    if (!res.value) return
    const app = res.value

    // if waiting time is more than 5 minutes, stop the application
    const waitingTime = Date.now() - app.updatedAt.getTime()
    if (waitingTime > 1000 * 60 * 5) {
      await db.collection<Application>('Application').updateOne(
        { appid: app.appid, phase: ApplicationPhase.Starting },
        {
          $set: {
            state: ApplicationState.Stopped,
            phase: ApplicationPhase.Started,
            lockedAt: TASK_LOCK_INIT_TIME,
            updatedAt: new Date(),
          },
        },
      )

      this.logger.log(`${app.appid} updated to state Stopped due to timeout`)
      return
    }

    const appid = app.appid

    const ddb = await this.dedicatedDatabaseService.findOne(appid)
    if (ddb) {
      if (ddb.state === DedicatedDatabaseState.Stopped) {
        await this.dedicatedDatabaseService.updateState(
          appid,
          DedicatedDatabaseState.Running,
        )
        await this.relock(appid, waitingTime)
        return
      }

      if (ddb.phase !== DedicatedDatabasePhase.Started) {
        await this.relock(appid, waitingTime)
        return
      }
    }

    // create instance
    await this.instanceService.create(app.appid)

    const instance = await this.instanceService.get(appid)
    const unavailable =
      instance.deployment?.status?.unavailableReplicas || false
    if (unavailable) {
      await this.relock(appid, waitingTime)
      return
    }

    const available = isConditionTrue(
      'Available',
      instance.deployment?.status?.conditions || [],
    )
    if (!available) {
      await this.relock(appid, waitingTime)
      return
    }

    if (!instance.service) {
      await this.relock(appid, waitingTime)
      return
    }

    // active runtime domain
    await db
      .collection<RuntimeDomain>('RuntimeDomain')
      .updateOne(
        { appid, state: DomainState.Inactive },
        { $set: { state: DomainState.Active, updatedAt: new Date() } },
      )

    // active website domain
    await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .updateMany(
        { appid, state: DomainState.Inactive },
        { $set: { state: DomainState.Active, updatedAt: new Date() } },
      )

    // active bucket domain
    await db
      .collection<BucketDomain>('BucketDomain')
      .updateMany(
        { appid, state: DomainState.Inactive },
        { $set: { state: DomainState.Active, updatedAt: new Date() } },
      )

    // active triggers if any
    await db
      .collection<CronTrigger>('CronTrigger')
      .updateMany(
        { appid, state: TriggerState.Inactive },
        { $set: { state: TriggerState.Active, updatedAt: new Date() } },
      )

    // if state is `Restarting`, update state to `Running` with phase `Started`
    let toState = app.state
    if (app.state === ApplicationState.Restarting) {
      toState = ApplicationState.Running
    }

    // update application state
    await db.collection<Application>('Application').updateOne(
      { appid, phase: ApplicationPhase.Starting },
      {
        $set: {
          state: toState,
          phase: ApplicationPhase.Started,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
      },
    )

    this.logger.debug(`Application ${app.appid} updated to phase started`)
  }

  /**
   * State `Stopped`:
   * - move phase `Started` to `Stopping`
   */
  async handleStoppedState() {
    const db = SystemDatabase.db

    await db.collection<Application>('Application').updateMany(
      {
        state: ApplicationState.Stopped,
        phase: ApplicationPhase.Started,
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: {
          lockedAt: TASK_LOCK_INIT_TIME,
          phase: ApplicationPhase.Stopping,
          updatedAt: new Date(),
        },
      },
    )
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
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
        { sort: { lockedAt: 1, updatedAt: 1 }, returnDocument: 'after' },
      )

    if (!res.value) return
    const app = res.value
    const appid = app.appid

    const waitingTime = Date.now() - app.updatedAt.getTime()

    // inactive runtime domain
    await db
      .collection<RuntimeDomain>('RuntimeDomain')
      .updateOne(
        { appid, state: DomainState.Active },
        { $set: { state: DomainState.Inactive, updatedAt: new Date() } },
      )

    // inactive website domain
    await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .updateMany(
        { appid, state: DomainState.Active },
        { $set: { state: DomainState.Inactive, updatedAt: new Date() } },
      )

    // inactive bucket domain
    await db
      .collection<BucketDomain>('BucketDomain')
      .updateMany(
        { appid, state: DomainState.Active },
        { $set: { state: DomainState.Inactive, updatedAt: new Date() } },
      )

    // inactive triggers if any
    await db
      .collection<CronTrigger>('CronTrigger')
      .updateMany(
        { appid, state: TriggerState.Active },
        { $set: { state: TriggerState.Inactive, updatedAt: new Date() } },
      )

    const ddb = await this.dedicatedDatabaseService.findOne(appid)
    if (ddb && ddb.state !== DedicatedDatabaseState.Stopped) {
      await this.dedicatedDatabaseService.updateState(
        appid,
        DedicatedDatabaseState.Stopped,
      )
      await this.relock(appid, waitingTime)
      return
    }

    // check if the instance is removed
    const instance = await this.instanceService.get(app.appid)
    if (instance.deployment) {
      await this.instanceService.remove(app.appid)
      await this.relock(appid, waitingTime)
      return
    }

    // check if the service is removed
    if (instance.service) {
      await this.instanceService.remove(app.appid)
      await this.relock(appid, waitingTime)
      return
    }

    // update application phase to `Stopped`
    await db.collection<Application>('Application').updateOne(
      { appid, phase: ApplicationPhase.Stopping },
      {
        $set: {
          phase: ApplicationPhase.Stopped,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
      },
    )

    this.logger.log(`Application ${app.appid} updated to phase Stopped`)
  }

  /**
   * State `Restarting`:
   * - move phase `Started` to `Starting`
   */
  async handleRestartingState() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          state: ApplicationState.Restarting,
          phase: {
            $in: [ApplicationPhase.Started, ApplicationPhase.Stopped],
          },
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
        { sort: { lockedAt: 1, updatedAt: 1 }, returnDocument: 'after' },
      )

    if (!res.value) return
    const app = res.value

    await this.dedicatedDatabaseService.updateState(
      app.appid,
      DedicatedDatabaseState.Restarting,
    )

    await this.instanceService.restart(app.appid)

    // update application phase to `Starting`
    await db.collection<Application>('Application').updateOne(
      {
        appid: app.appid,
        phase: {
          $in: [ApplicationPhase.Started, ApplicationPhase.Stopped],
        },
      },
      {
        $set: {
          phase: ApplicationPhase.Starting,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
      },
    )
    this.logger.log(`Application ${app.appid} updated to phase Starting`)
  }

  /**
   * Relock application by appid, lockedTime is in milliseconds
   */
  async relock(appid: string, lockedTime = 0) {
    if (lockedTime <= 2 * 60 * 1000) {
      lockedTime = Math.ceil(lockedTime / 10)
    }

    if (lockedTime > 2 * 60 * 1000) {
      lockedTime = this.lockTimeout * 1000
    }

    const db = SystemDatabase.db
    const lockedAt = new Date(Date.now() - 1000 * this.lockTimeout + lockedTime)
    await db
      .collection<Application>('Application')
      .updateOne({ appid: appid }, { $set: { lockedAt } })
  }

  private getHourTime() {
    const latestTime = new Date()
    latestTime.setMinutes(0)
    latestTime.setSeconds(0)
    latestTime.setMilliseconds(0)
    latestTime.setHours(latestTime.getHours())
    return latestTime
  }
}
