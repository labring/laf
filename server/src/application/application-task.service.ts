import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Application, ApplicationPhase, ApplicationState } from '@prisma/client'
import * as assert from 'node:assert'
import { StorageService } from '../storage/storage.service'
import { DatabaseService } from '../database/database.service'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { RegionService } from 'src/region/region.service'
import { FunctionDomainService } from 'src/gateway/function-domain.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'

@Injectable()
export class ApplicationTaskService {
  readonly lockTimeout = 60 // in second
  private readonly logger = new Logger(ApplicationTaskService.name)

  constructor(
    private readonly regionService: RegionService,
    private readonly clusterService: ClusterService,
    private readonly storageService: StorageService,
    private readonly databaseService: DatabaseService,
    private readonly gatewayService: FunctionDomainService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    // Phase `Creating` -> `Created`
    this.handleCreatingPhase()

    // Phase `Deleting` -> `Deleted`
    this.handleDeletingPhase()

    // State `Deleted`
    this.handleDeletedState()

    this.clearTimeoutLocks()
  }

  /**
   * Phase `Creating`:
   * - create namespace
   * - create storage user
   * - create gateway domain
   * - create database & user
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          phase: ApplicationPhase.Creating,
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
    const appid = app.appid

    this.logger.log(`handleCreatingPhase matched app ${appid}, locked it`)

    // get region by appid
    const region = await this.regionService.findByAppId(appid)
    assert(region, `Region ${app.regionName} not found`)

    // reconcile namespace
    const namespace = await this.clusterService.getAppNamespace(region, appid)
    if (!namespace) {
      this.logger.debug(`Creating namespace for application ${appid}`)
      await this.clusterService.createAppNamespace(region, appid, app.createdBy)
      return await this.unlock(appid)
    }

    // reconcile storage
    let storage = await this.storageService.findOne(appid)
    if (!storage) {
      this.logger.log(`Creating storage for application ${appid}`)
      const res = await this.storageService.create(app.appid)
      if (res) {
        storage = res
      }
    }

    // reconcile database
    let database = await this.databaseService.findOne(appid)
    if (!database) {
      this.logger.log(`Creating database for application ${appid}`)
      database = await this.databaseService.create(app.appid)
    }

    // reconcile gateway
    let gateway = await this.gatewayService.findOne(appid)
    if (!gateway) {
      this.logger.log(`Creating gateway for application ${appid}`)
      gateway = await this.gatewayService.create(appid)
    }

    if (!gateway) return await this.unlock(appid)
    if (!storage) return await this.unlock(appid)
    if (!database) return await this.unlock(appid)

    // update application phase to `Created`
    const updated = await db.collection<Application>('Application').updateOne(
      {
        _id: app._id,
        phase: ApplicationPhase.Creating,
      },
      {
        $set: {
          phase: ApplicationPhase.Created,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
    if (updated.modifiedCount > 0)
      this.logger.debug('app phase updated to `Created`:', app.appid)
  }

  /**
   * Phase `Deleting`:
   * - delete namespace, storage, database, gateway
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          phase: ApplicationPhase.Deleting,
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

    // get region by appid
    const app = res.value
    const appid = app.appid
    const region = await this.regionService.findByAppId(appid)
    assert(region, `Region ${app.regionName} not found`)

    // delete namespace (include the instance)
    const namespace = await this.clusterService.getAppNamespace(region, appid)
    if (namespace) {
      await this.clusterService.removeAppNamespace(region, appid)
      return await this.unlock(appid)
    }

    // delete storage
    const storage = await this.storageService.findOne(appid)
    if (storage) {
      await this.storageService.delete(appid)
      return await this.unlock(appid)
    }

    // delete database
    const database = await this.databaseService.findOne(appid)
    if (database) {
      await this.databaseService.delete(database)
      return await this.unlock(appid)
    }

    // delete gateway
    const gateway = await this.gatewayService.findOne(appid)
    if (gateway) {
      await this.gatewayService.delete(appid)
      return await this.unlock(appid)
    }

    // TODO: delete app configuration

    // update phase to `Deleted`
    const updated = await db.collection<Application>('Application').updateOne(
      {
        _id: app._id,
        phase: ApplicationPhase.Deleting,
      },
      {
        $set: {
          phase: ApplicationPhase.Deleted,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
    if (updated.modifiedCount > 0)
      this.logger.debug('app phase updated to `Deleted`:', app.appid)
  }

  /**
   * State `Deleted`:
   * - move phase `Created` | `Started` | `Stopped` to `Deleting`
   * - delete phase `Deleted` documents
   */
  async handleDeletedState() {
    const db = SystemDatabase.db

    await db.collection<Application>('Application').updateMany(
      {
        state: ApplicationState.Deleted,
        phase: {
          $in: [
            ApplicationPhase.Created,
            ApplicationPhase.Started,
            ApplicationPhase.Stopped,
          ],
        },
      },
      {
        $set: {
          phase: ApplicationPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    await db.collection<Application>('Application').deleteMany({
      // TODO: support reset app or not? keep this line now.
      // state: ApplicationState.Deleted,
      phase: ApplicationPhase.Deleted,
    })
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
    if (updated.modifiedCount > 0) this.logger.debug('unlocked app: ' + appid)
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
