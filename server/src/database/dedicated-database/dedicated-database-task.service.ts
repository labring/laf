import { Cron, CronExpression } from '@nestjs/schedule'
import { SystemDatabase } from 'src/system-database'
import {
  DedicatedDatabase,
  DedicatedDatabasePhase,
  DedicatedDatabaseState,
} from '../entities/dedicated-database'
import { DedicatedDatabaseService } from './dedicated-database.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { Injectable, Logger } from '@nestjs/common'
import { RegionService } from 'src/region/region.service'

@Injectable()
export class DedicatedDatabaseTaskService {
  private readonly logger = new Logger(DedicatedDatabaseTaskService.name)
  private readonly lockTimeout = 15 // in seconds
  private readonly db = SystemDatabase.db

  constructor(
    private readonly regionService: RegionService,
    private readonly dbService: DedicatedDatabaseService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    this.handleDeletingPhase().catch((err) => {
      this.logger.error(err)
    })
    this.handleStoppingPhase().catch((err) => {
      this.logger.error(err)
    })
    this.handleStartingPhase().catch((err) => {
      this.logger.error(err)
    })
    this.handleDeletedState().catch((err) => {
      this.logger.error(err)
    })
    this.handleStoppedState().catch((err) => {
      this.logger.error(err)
    })
    this.handleRestartingState().catch((err) => {
      this.logger.error(err)
    })
    this.handleRunningState().catch((err) => {
      this.logger.error(err)
    })
  }

  async handleStartingPhase() {
    const res = await this.db
      .collection<DedicatedDatabase>('DedicatedDatabase')
      .findOneAndUpdate(
        {
          phase: DedicatedDatabasePhase.Starting,
          lockedAt: { $lt: new Date(Date.now() - this.lockTimeout * 1000) },
        },
        { $set: { lockedAt: new Date() } },
        { sort: { lockedAt: 1, updatedAt: 1 }, returnDocument: 'after' },
      )

    if (!res.value) return
    const data = res.value
    const appid = data.appid

    const region = await this.regionService.findByAppId(appid)
    let manifest = await this.dbService.getDeployManifest(region, appid)

    if (!manifest || manifest.spec.componentSpecs[0].replicas === 0) {
      await this.dbService.applyDeployManifest(region, appid)
    }

    // if waiting time is more than 5 minutes, stop
    const waitingTime = Date.now() - data.updatedAt.getTime()
    if (waitingTime > 1000 * 60 * 5) {
      await this.db
        .collection<DedicatedDatabase>('DedicatedDatabase')
        .updateOne(
          { appid, phase: DedicatedDatabasePhase.Starting },
          {
            $set: {
              state: DedicatedDatabaseState.Stopped,
              phase: DedicatedDatabasePhase.Stopping,
              lockedAt: TASK_LOCK_INIT_TIME,
              updatedAt: new Date(),
            },
          },
        )

      this.logger.log(
        `dedicated database ${appid} updated to state Stopped due to timeout`,
      )
      return
    }

    manifest = await this.dbService.getDeployManifest(region, appid)
    const unavailable = manifest?.status?.phase !== 'Running'
    if (unavailable) {
      await this.relock(appid, waitingTime)
      return
    }

    // if state is `Restarting`, update state to `Running` with phase `Started`
    let toState = data.state
    if (toState === DedicatedDatabaseState.Restarting) {
      toState = DedicatedDatabaseState.Running
    }

    await this.db.collection<DedicatedDatabase>('DedicatedDatabase').updateOne(
      {
        appid,
        phase: DedicatedDatabasePhase.Starting,
      },
      {
        $set: {
          state: toState,
          phase: DedicatedDatabasePhase.Started,
          lockedAt: TASK_LOCK_INIT_TIME,
          updatedAt: new Date(),
        },
      },
    )

    this.logger.debug(`dedicated database ${appid} updated to phase started`)
  }

  async handleDeletingPhase() {
    const res = await this.db
      .collection<DedicatedDatabase>('DedicatedDatabase')
      .findOneAndUpdate(
        {
          phase: DedicatedDatabasePhase.Deleting,
          lockedAt: {
            $lt: new Date(Date.now() - this.lockTimeout * 1000),
          },
        },
        { $set: { lockedAt: new Date() } },
        { sort: { lockedAt: 1, updatedAt: 1 }, returnDocument: 'after' },
      )

    if (!res.value) return
    const data = res.value
    const appid = data.appid

    const waitingTime = Date.now() - data.updatedAt.getTime()

    const region = await this.regionService.findByAppId(appid)
    const manifest = await this.dbService.getDeployManifest(region, appid)

    if (manifest) {
      await this.dbService.deleteDeployManifest(region, appid)
      await this.relock(appid, waitingTime)
    }

    await this.db.collection<DedicatedDatabase>('DedicatedDatabase').updateOne(
      {
        appid,
        phase: DedicatedDatabasePhase.Deleting,
      },
      {
        $set: {
          phase: DedicatedDatabasePhase.Deleted,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  async handleStoppingPhase() {
    const res = await this.db
      .collection<DedicatedDatabase>('DedicatedDatabase')
      .findOneAndUpdate(
        {
          phase: DedicatedDatabasePhase.Stopping,
          lockedAt: {
            $lt: new Date(Date.now() - this.lockTimeout * 1000),
          },
        },
        {
          $set: {
            lockedAt: new Date(),
          },
        },
      )

    if (!res.value) return
    const data = res.value
    const appid = data.appid

    const region = await this.regionService.findByAppId(appid)
    const waitingTime = Date.now() - data.updatedAt.getTime()

    const manifest = await this.dbService.getDeployManifest(region, appid)
    if (manifest && manifest.spec.componentSpecs[0].replicas !== 0) {
      await this.dbService.applyDeployManifest(region, appid, {
        replicas: 0,
      })
      await this.relock(appid, waitingTime)
    }

    await this.db.collection<DedicatedDatabase>('DedicatedDatabase').updateOne(
      {
        appid: data.appid,
        phase: DedicatedDatabasePhase.Stopping,
      },
      {
        $set: {
          phase: DedicatedDatabasePhase.Stopped,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    this.logger.log(`dedicated database ${appid} updated to phase Stopped`)
  }

  async handleDeletedState() {
    const db = SystemDatabase.db

    await db.collection<DedicatedDatabase>('DedicatedDatabase').updateMany(
      {
        state: DedicatedDatabaseState.Deleted,
        phase: {
          $in: [DedicatedDatabasePhase.Started, DedicatedDatabasePhase.Stopped],
        },
      },
      {
        $set: {
          phase: DedicatedDatabasePhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    await db.collection<DedicatedDatabase>('DedicatedDatabase').deleteMany({
      state: DedicatedDatabaseState.Deleted,
      phase: DedicatedDatabasePhase.Deleted,
    })
  }

  async handleStoppedState() {
    const db = SystemDatabase.db

    await db.collection<DedicatedDatabase>('DedicatedDatabase').updateMany(
      {
        state: DedicatedDatabaseState.Stopped,
        phase: {
          $in: [DedicatedDatabasePhase.Started],
        },
      },
      {
        $set: {
          phase: DedicatedDatabasePhase.Stopping,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  async handleRunningState() {
    const db = SystemDatabase.db

    await db.collection<DedicatedDatabase>('DedicatedDatabase').updateMany(
      {
        state: DedicatedDatabaseState.Running,
        phase: {
          $in: [DedicatedDatabasePhase.Stopped],
        },
      },
      {
        $set: {
          phase: DedicatedDatabasePhase.Starting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  async handleRestartingState() {
    const db = SystemDatabase.db

    await db.collection<DedicatedDatabase>('DedicatedDatabase').updateMany(
      {
        state: DedicatedDatabaseState.Restarting,
        phase: DedicatedDatabasePhase.Started,
      },
      {
        $set: {
          phase: DedicatedDatabasePhase.Stopping,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    await db.collection<DedicatedDatabase>('DedicatedDatabase').updateMany(
      {
        state: DedicatedDatabaseState.Restarting,
        phase: DedicatedDatabasePhase.Stopped,
      },
      {
        $set: {
          phase: DedicatedDatabasePhase.Starting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    await db.collection<DedicatedDatabase>('DedicatedDatabase').deleteMany({
      state: DedicatedDatabaseState.Deleted,
      phase: DedicatedDatabasePhase.Deleted,
    })
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
      .collection<DedicatedDatabase>('DedicatedDatabase')
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
