import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { ApplicationService } from 'src/application/application.service'
import { ApplicationWithRelations } from 'src/application/entities/application'
import { SystemDatabase } from 'src/system-database'
import { UserQuota } from './entities/user-quota'
import { SettingService } from 'src/setting/setting.service'
import { DatabaseSync } from 'src/database/entities/database-sync'

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name)
  private db = SystemDatabase.db
  constructor(
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
    private readonly settingService: SettingService,
  ) {}

  async resourceLimit(uid: ObjectId) {
    const userQuota = await this.getUserQuota(uid)
    if (!userQuota) {
      return true
    }

    const allApplications: ApplicationWithRelations[] =
      await this.applicationService.findAllByUser(uid)

    let totalLimitCPU = 0
    let totalLimitMemory = 0

    for (const app of allApplications) {
      if (app.bundle && app.bundle.resource) {
        totalLimitCPU += app.bundle.resource.limitCPU
        totalLimitMemory += app.bundle.resource.limitMemory
      }
    }

    if (
      totalLimitCPU > userQuota.limitOfCPU ||
      totalLimitMemory > userQuota.limitOfMemory ||
      allApplications.length > userQuota.limitCountOfApplication
    ) {
      return true
    }

    return false
  }

  async databaseSyncLimit(uid: ObjectId) {
    const userQuota = await this.getUserQuota(uid)
    if (!userQuota) {
      return true
    }
    // Calculate the time range for counting DatabaseSync documents
    const currentTime = new Date()
    const startTime = new Date(
      currentTime.getTime() -
        userQuota.limitOfDatabaseSyncCount.timePeriodInSeconds * 1000,
    )

    const counts = await this.db
      .collection<DatabaseSync>('DatabaseSync')
      .countDocuments({
        uid: uid,
        createdAt: {
          $gte: startTime,
          $lte: currentTime,
        },
      })

    if (counts >= userQuota.limitOfDatabaseSyncCount.countLimit) {
      return true // The user has exceeded their limit
    }

    return false
  }

  async getUserQuota(uid: ObjectId) {
    const defaultUserQuotaSetting = await this.settingService.findOne(
      'resource_limit',
    )

    if (!defaultUserQuotaSetting) {
      return null
    }

    const defaultUserQuota: UserQuota = {
      uid,
      limitOfCPU: defaultUserQuotaSetting.metadata.limitOfCPU,
      limitOfMemory: defaultUserQuotaSetting.metadata.limitOfMemory,
      limitCountOfApplication:
        defaultUserQuotaSetting.metadata.limitCountOfApplication,
      limitOfDatabaseSyncCount: {
        countLimit:
          defaultUserQuotaSetting.metadata.limitOfDatabaseSyncCount.countLimit,
        timePeriodInSeconds:
          defaultUserQuotaSetting.metadata.limitOfDatabaseSyncCount
            .timePeriodInSeconds,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    let userQuota: UserQuota = await this.db
      .collection<UserQuota>('UserQuota')
      .findOne({ uid })

    if (!userQuota) {
      await this.db
        .collection<UserQuota>('UserQuota')
        .insertOne(defaultUserQuota)
      userQuota = defaultUserQuota
    }
    return userQuota
  }
}
