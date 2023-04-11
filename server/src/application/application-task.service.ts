import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  Application,
  ApplicationPhase,
  ApplicationState,
  DatabasePhase,
  DomainPhase,
  StoragePhase,
} from '@prisma/client'
import * as assert from 'node:assert'
import { StorageService } from '../storage/storage.service'
import { DatabaseService } from '../database/database.service'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { RegionService } from 'src/region/region.service'
import { RuntimeDomainService } from 'src/gateway/runtime-domain.service'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { TriggerService } from 'src/trigger/trigger.service'
import { FunctionService } from 'src/function/function.service'
import { ApplicationConfigurationService } from './configuration.service'
import { BundleService } from 'src/region/bundle.service'
import { WebsiteService } from 'src/website/website.service'
import { PolicyService } from 'src/database/policy/policy.service'
import { BucketDomainService } from 'src/gateway/bucket-domain.service'

@Injectable()
export class ApplicationTaskService {
  readonly lockTimeout = 60 // in second
  private readonly logger = new Logger(ApplicationTaskService.name)

  constructor(
    private readonly regionService: RegionService,
    private readonly clusterService: ClusterService,
    private readonly storageService: StorageService,
    private readonly databaseService: DatabaseService,
    private readonly runtimeDomainService: RuntimeDomainService,
    private readonly bucketDomainService: BucketDomainService,
    private readonly triggerService: TriggerService,
    private readonly functionService: FunctionService,
    private readonly configurationService: ApplicationConfigurationService,
    private readonly bundleService: BundleService,
    private readonly websiteService: WebsiteService,
    private readonly policyService: PolicyService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_APPLICATION_TASK) {
      return
    }

    // Phase `Creating` -> `Created`
    this.handleCreatingPhase().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Deleting` -> `Deleted`
    this.handleDeletingPhase().catch((err) => {
      this.logger.error(err)
    })

    // State `Deleted`
    this.handleDeletedState().catch((err) => {
      this.logger.error(err)
    })
  }

  /**
   * Phase `Creating`:
   * - create namespace
   * - create storage user
   * - create runtime domain
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
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
      )

    if (!res.value) return

    const app = res.value
    const appid = app.appid

    this.logger.log(`handleCreatingPhase matched app ${appid}, locked it`)

    // get region by appid
    const region = await this.regionService.findByAppId(appid)
    assert(region, `Region ${region.name} not found`)

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
      storage = await this.storageService.create(app.appid)
    }

    // reconcile database
    let database = await this.databaseService.findOne(appid)
    if (!database) {
      this.logger.log(`Creating database for application ${appid}`)
      database = await this.databaseService.create(app.appid)
    }

    // reconcile runtime domain
    let runtimeDomain = await this.runtimeDomainService.findOne(appid)
    if (!runtimeDomain) {
      this.logger.log(`Creating gateway for application ${appid}`)
      runtimeDomain = await this.runtimeDomainService.create(appid)
    }

    // waiting resources' phase to be `Created`
    if (runtimeDomain?.phase !== DomainPhase.Created) {
      return await this.unlock(appid)
    }

    if (storage?.phase !== StoragePhase.Created) {
      return await this.unlock(appid)
    }

    if (database?.phase !== DatabasePhase.Created) {
      return await this.unlock(appid)
    }

    // update application phase to `Created`
    await db.collection<Application>('Application').updateOne(
      { _id: app._id, phase: ApplicationPhase.Creating },
      {
        $set: {
          phase: ApplicationPhase.Created,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    this.logger.log('app phase updated to `Created`: ' + app.appid)
  }

  /**
   * Phase `Deleting`:
   * - delete triggers (k8s cronjob)
   * - delete cloud functions
   * - delete policies
   * - delete application configuration
   * - delete application bundle
   * - delete website
   * - delete runtime domain (apisix route)
   * - delete bucket domain (apisix route)
   * - delete database (mongo db)
   * - delete storage (minio buckets & user)
   * - delete namespace
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        {
          phase: ApplicationPhase.Deleting,
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
      )

    if (!res.value) return

    // get region by appid
    const app = res.value
    const appid = app.appid
    const region = await this.regionService.findByAppId(appid)
    assert(region, `Region ${region.name} not found`)

    // delete triggers
    const hadTriggers = await this.triggerService.count(appid)
    if (hadTriggers > 0) {
      await this.triggerService.removeAll(appid)
      return await this.unlock(appid)
    }

    // delete cloud functions
    const hadFunctions = await this.functionService.count(appid)
    if (hadFunctions > 0) {
      await this.functionService.removeAll(appid)
      return await this.unlock(appid)
    }

    // delete database proxy policies
    const hadPolicies = await this.policyService.count(appid)
    if (hadPolicies > 0) {
      await this.policyService.removeAll(appid)
      return await this.unlock(appid)
    }

    // delete application configuration
    const hadConfigurations = await this.configurationService.count(appid)
    if (hadConfigurations > 0) {
      await this.configurationService.remove(appid)
      return await this.unlock(appid)
    }

    // delete application bundle
    const bundle = await this.bundleService.findApplicationBundle(appid)
    if (bundle) {
      await this.bundleService.deleteApplicationBundle(appid)
      return await this.unlock(appid)
    }

    // delete website
    const hadWebsites = await this.websiteService.count(appid)
    if (hadWebsites > 0) {
      await this.websiteService.removeAll(appid)
      return await this.unlock(appid)
    }

    // delete runtime domain
    const runtimeDomain = await this.runtimeDomainService.findOne(appid)
    if (runtimeDomain) {
      await this.runtimeDomainService.delete(appid)
      return await this.unlock(appid)
    }

    // delete bucket domains
    const hadBucketDomains = await this.bucketDomainService.count(appid)
    if (hadBucketDomains > 0) {
      await this.bucketDomainService.deleteAll(appid)
      return await this.unlock(appid)
    }

    // delete application database
    const database = await this.databaseService.findOne(appid)
    if (database) {
      await this.databaseService.delete(database)
      return await this.unlock(appid)
    }

    // delete application storage
    const storage = await this.storageService.findOne(appid)
    if (storage) {
      await this.storageService.deleteUsersAndBuckets(appid)
      return await this.unlock(appid)
    }

    // delete application namespace (include the instance)
    const namespace = await this.clusterService.getAppNamespace(region, appid)
    if (namespace) {
      await this.clusterService.removeAppNamespace(region, appid)
      return await this.unlock(appid)
    }

    // update phase to `Deleted`
    await db.collection<Application>('Application').updateOne(
      { _id: app._id, phase: ApplicationPhase.Deleting },
      {
        $set: {
          phase: ApplicationPhase.Deleted,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    this.logger.log('app phase updated to `Deleted`: ' + app.appid)
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
      state: ApplicationState.Deleted,
      phase: ApplicationPhase.Deleted,
    })
  }

  /**
   * Unlock application by appid
   */
  async unlock(appid: string) {
    const db = SystemDatabase.db
    await db
      .collection<Application>('Application')
      .updateOne({ appid: appid }, { $set: { lockedAt: TASK_LOCK_INIT_TIME } })
  }
}
