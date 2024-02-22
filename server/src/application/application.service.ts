import { Injectable, Logger } from '@nestjs/common'
import * as nanoid from 'nanoid'
import { UpdateApplicationBundleDto } from './dto/update-application.dto'
import {
  APPLICATION_SECRET_KEY,
  ServerConfig,
  TASK_LOCK_INIT_TIME,
} from '../constants'
import { GenerateAlphaNumericPassword } from '../utils/random'
import { CreateApplicationDto } from './dto/create-application.dto'
import { SystemDatabase } from 'src/system-database'
import {
  Application,
  ApplicationPhase,
  ApplicationState,
  ApplicationWithRelations,
} from './entities/application'
import { ObjectId } from 'mongodb'
import { ApplicationConfiguration } from './entities/application-configuration'
import {
  ApplicationBundle,
  ApplicationBundleResource,
} from './entities/application-bundle'
import { GroupService } from 'src/group/group.service'
import { GroupMember } from 'src/group/entities/group-member'
import { RegionService } from 'src/region/region.service'
import { assert } from 'console'
import { Region } from 'src/region/entities/region'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ApplicationCreatingEvent } from './events/application-creating.event'

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name)

  constructor(
    private readonly groupService: GroupService,
    private readonly regionService: RegionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create application
   * - create configuration
   * - create bundle
   * - create application
   */
  async create(
    regionId: ObjectId,
    userid: ObjectId,
    appid: string,
    dto: CreateApplicationDto,
    isTrialTier: boolean,
  ) {
    const client = SystemDatabase.client
    const db = client.db()
    const session = client.startSession()
    const region = await this.regionService.findOne(regionId)
    assert(region, 'region cannot be empty')

    try {
      // start transaction
      session.startTransaction()

      // create application configuration
      const appSecret = {
        name: APPLICATION_SECRET_KEY,
        value: GenerateAlphaNumericPassword(64),
      }
      await db
        .collection<ApplicationConfiguration>('ApplicationConfiguration')
        .insertOne(
          {
            appid,
            environments: [appSecret],
            dependencies: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )

      // create application bundle
      await db.collection<ApplicationBundle>('ApplicationBundle').insertOne(
        {
          appid,
          resource: this.buildBundleResource(region, dto),
          autoscaling: this.buildAutoscalingConfig(dto),
          isTrialTier: isTrialTier,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

      await this.eventEmitter.emitAsync(
        ApplicationCreatingEvent.eventName,
        new ApplicationCreatingEvent({
          region,
          appid,
          session,
          dto,
        }),
      )

      // create application
      await db.collection<Application>('Application').insertOne(
        {
          appid,
          name: dto.name,
          state: dto.state || ApplicationState.Running,
          phase: ApplicationPhase.Creating,
          tags: [],
          createdBy: userid,
          lockedAt: TASK_LOCK_INIT_TIME,
          regionId: new ObjectId(dto.regionId),
          runtimeId: new ObjectId(dto.runtimeId),
          billingLockedAt: TASK_LOCK_INIT_TIME,
          latestBillingTime: this.getHourTime(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

      await this.groupService.create(appid, userid, appid)
      // commit transaction
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw Error(error)
    } finally {
      if (session) await session.endSession()
    }
  }

  async findAllByUser(userid: ObjectId) {
    const db = SystemDatabase.db

    const doc = await db
      .collection<GroupMember>('GroupMember')
      .aggregate()
      .match({
        uid: userid,
      })
      .lookup({
        from: 'GroupApplication',
        localField: 'groupId',
        foreignField: 'groupId',
        as: 'applications',
      })
      .unwind('$applications')
      .project({
        _id: 0,
        appid: '$applications.appid',
      })
      .toArray()

    const res = db
      .collection<Application>('Application')
      .aggregate()
      .match({
        $and: [
          {
            $or: [
              { appid: { $in: doc.map((v) => v.appid) } },
              { createdBy: userid },
            ],
          },
          { phase: { $ne: ApplicationPhase.Deleted } },
        ],
      })
      .lookup({
        from: 'ApplicationBundle',
        localField: 'appid',
        foreignField: 'appid',
        as: 'bundle',
      })
      .unwind('$bundle')
      .lookup({
        from: 'Runtime',
        localField: 'runtimeId',
        foreignField: '_id',
        as: 'runtime',
      })
      .unwind('$runtime')
      .project<ApplicationWithRelations>({
        'bundle.resource.requestCPU': 0,
        'bundle.resource.requestMemory': 0,
        'bundle.resource.dedicatedDatabase.requestCPU': 0,
        'bundle.resource.dedicatedDatabase.requestMemory': 0,
      })
      .toArray()

    return res
  }

  async findOne(appid: string) {
    const db = SystemDatabase.db

    const doc = await db
      .collection('Application')
      .aggregate<ApplicationWithRelations>()
      .match({ appid })
      .lookup({
        from: 'ApplicationBundle',
        localField: 'appid',
        foreignField: 'appid',
        as: 'bundle',
      })
      .unwind('$bundle')
      .lookup({
        from: 'Runtime',
        localField: 'runtimeId',
        foreignField: '_id',
        as: 'runtime',
      })
      .unwind('$runtime')
      .lookup({
        from: 'ApplicationConfiguration',
        localField: 'appid',
        foreignField: 'appid',
        as: 'configuration',
      })
      .unwind('$configuration')
      .lookup({
        from: 'RuntimeDomain',
        localField: 'appid',
        foreignField: 'appid',
        as: 'domain',
      })
      .unwind({ path: '$domain', preserveNullAndEmptyArrays: true })
      .project<ApplicationWithRelations>({
        'bundle.resource.requestCPU': 0,
        'bundle.resource.requestMemory': 0,
        'bundle.resource.dedicatedDatabase.requestCPU': 0,
        'bundle.resource.dedicatedDatabase.requestMemory': 0,
      })
      .next()

    return doc
  }

  async findOneUnsafe(appid: string) {
    const db = SystemDatabase.db

    const doc = await db
      .collection('Application')
      .aggregate<ApplicationWithRelations>()
      .match({ appid })
      .lookup({
        from: 'Region',
        localField: 'regionId',
        foreignField: '_id',
        as: 'region',
      })
      .unwind('$region')
      .lookup({
        from: 'ApplicationBundle',
        localField: 'appid',
        foreignField: 'appid',
        as: 'bundle',
      })
      .unwind('$bundle')
      .lookup({
        from: 'Runtime',
        localField: 'runtimeId',
        foreignField: '_id',
        as: 'runtime',
      })
      .unwind('$runtime')
      .lookup({
        from: 'ApplicationConfiguration',
        localField: 'appid',
        foreignField: 'appid',
        as: 'configuration',
      })
      .unwind('$configuration')
      .lookup({
        from: 'RuntimeDomain',
        localField: 'appid',
        foreignField: 'appid',
        as: 'domain',
      })
      .unwind({ path: '$domain', preserveNullAndEmptyArrays: true })
      .next()

    return doc
  }

  async findTrialApplications(userid: ObjectId) {
    const db = SystemDatabase.db

    const apps = await db
      .collection<Application>('Application')
      .aggregate<Application>()
      .match({ createdBy: userid })
      .lookup({
        from: 'ApplicationBundle',
        localField: 'appid',
        foreignField: 'appid',
        as: 'bundle',
      })
      .unwind('$bundle')
      .match({ 'bundle.isTrialTier': true })
      .toArray()

    return apps
  }

  async countByUser(userid: ObjectId) {
    const db = SystemDatabase.db

    const count = await db
      .collection<Application>('Application')
      .countDocuments({ createdBy: userid })

    return count
  }

  async updateName(appid: string, name: string) {
    const db = SystemDatabase.db
    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        { appid },
        { $set: { name, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    return res.value
  }

  async updateState(appid: string, state: ApplicationState) {
    const db = SystemDatabase.db
    const res = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        { appid },
        { $set: { state, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    return res.value
  }

  async updateBundle(
    appid: string,
    dto: UpdateApplicationBundleDto,
    isTrialTier: boolean,
  ) {
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region cannot be empty')

    const resource = this.buildBundleResource(region, dto)
    const autoscaling = this.buildAutoscalingConfig(dto)

    const client = SystemDatabase.client
    const db = SystemDatabase.db
    const session = client.startSession()

    try {
      session.startTransaction()

      const res = await db
        .collection<ApplicationBundle>('ApplicationBundle')
        .findOneAndUpdate(
          { appid },
          {
            $set: { resource, autoscaling, updatedAt: new Date(), isTrialTier },
          },
          {
            projection: {
              'bundle.resource.requestCPU': 0,
              'bundle.resource.requestMemory': 0,
              'bundle.resource.dedicatedDatabase.requestCPU': 0,
              'bundle.resource.dedicatedDatabase.requestMemory': 0,
            },
            returnDocument: 'after',
          },
        )

      await session.commitTransaction()
      return res.value
    } catch (error) {
      await session.abortTransaction()
      this.logger.error(error)
      throw error
    } finally {
      await session.endSession()
    }
  }

  async remove(appid: string) {
    const db = SystemDatabase.db
    const doc = await db
      .collection<Application>('Application')
      .findOneAndUpdate(
        { appid },
        { $set: { state: ApplicationState.Deleted, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    return doc.value
  }

  /**
   * Generate unique application id
   * @returns
   */
  async tryGenerateUniqueAppid() {
    const db = SystemDatabase.db

    for (let i = 0; i < 10; i++) {
      const appid = this.generateAppID(ServerConfig.APPID_LENGTH)
      const existed = await db
        .collection<Application>('Application')
        .findOne({ appid })

      if (!existed) return appid
    }

    throw new Error('Generate appid failed')
  }

  private generateAppID(len: number) {
    len = len || 6

    // ensure prefixed with letter
    const only_alpha = 'abcdefghijklmnopqrstuvwxyz'
    const alphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const prefix = nanoid.customAlphabet(only_alpha, 1)()
    const nano = nanoid.customAlphabet(alphanumeric, len - 1)
    return prefix + nano()
  }

  private buildBundleResource(region: Region, dto: UpdateApplicationBundleDto) {
    const bundleConf = region.bundleConf
    const cpuRatio = bundleConf?.cpuRequestLimitRatio || 0.1
    const memoryRatio = bundleConf?.memoryRequestLimitRatio || 0.5

    const requestCPU = Math.floor(dto.cpu * cpuRatio)
    const requestMemory = Math.floor(dto.memory * memoryRatio)
    const limitCountOfCloudFunction = Math.floor(dto.cpu * 1)

    const magicNumber = Math.floor(dto.cpu * 0.03)
    const limitCountOfBucket = Math.max(3, magicNumber)
    const limitCountOfDatabasePolicy = Math.max(3, magicNumber)
    const limitCountOfTrigger = Math.max(1, magicNumber)
    const limitCountOfWebsiteHosting = Math.max(3, magicNumber)
    const limitDatabaseTPS = Math.floor(dto.cpu * 0.1)
    const limitStorageTPS = Math.floor(dto.cpu * 1)
    const reservedTimeAfterExpired = 60 * 60 * 24 * 31 // 31 days

    const ddbRequestCPU = dto.dedicatedDatabase
      ? Math.floor(dto.dedicatedDatabase.cpu * cpuRatio)
      : 0
    const ddbRequestMemory = dto.dedicatedDatabase
      ? Math.floor(dto.dedicatedDatabase.memory * memoryRatio)
      : 0

    const resource = new ApplicationBundleResource({
      limitCPU: dto.cpu,
      limitMemory: dto.memory,
      requestCPU,
      requestMemory,
      databaseCapacity: dto.databaseCapacity || 0,
      storageCapacity: dto.storageCapacity,

      limitCountOfCloudFunction,
      limitCountOfBucket,
      limitCountOfDatabasePolicy,
      limitCountOfTrigger,
      limitCountOfWebsiteHosting,
      limitDatabaseTPS,
      limitStorageTPS,
      reservedTimeAfterExpired,

      dedicatedDatabase: {
        limitCPU: dto.dedicatedDatabase?.cpu || 0,
        limitMemory: dto.dedicatedDatabase?.memory || 0,
        requestCPU: ddbRequestCPU,
        requestMemory: ddbRequestMemory,
        capacity: dto.dedicatedDatabase?.capacity || 0,
        replicas: dto.dedicatedDatabase?.replicas || 0,
      },
    })

    return resource
  }

  private buildAutoscalingConfig(dto: UpdateApplicationBundleDto) {
    const autoscaling = {
      enable: false,
      minReplicas: 1,
      maxReplicas: 5,
      targetCPUUtilizationPercentage: null,
      targetMemoryUtilizationPercentage: null,
      ...dto.autoscaling,
    }
    return autoscaling
  }

  private getHourTime() {
    const latestTime = new Date()
    latestTime.setMinutes(0)
    latestTime.setSeconds(0)
    latestTime.setMilliseconds(0)
    return latestTime
  }
}
