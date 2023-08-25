import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { ApplicationService } from 'src/application/application.service'
import { ApplicationWithRelations } from 'src/application/entities/application'
import { SystemDatabase } from 'src/system-database'
import { UserQuota } from './entities/user-quota'
import { SettingService } from 'src/setting/setting.service'

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name)
  constructor(
    @Inject(forwardRef(() => ApplicationService))
    private readonly applicationService: ApplicationService,
    private readonly settingService: SettingService,
  ) {}

  async resourceLimit(uid: ObjectId) {
    const client = SystemDatabase.client
    const db = client.db()

    const defaultUserQuotaSetting = await this.settingService.findOne(
      'resource_limit',
    )

    if (!defaultUserQuotaSetting) {
      return true
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

    const userQuota: UserQuota = await db
      .collection<UserQuota>('UserQuota')
      .findOne({ uid })

    if (!userQuota) {
      await db.collection<UserQuota>('UserQuota').insertOne(defaultUserQuota)
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
}
