import { Injectable, Logger } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { ApplicationConfiguration } from './entities/application-configuration'
import * as assert from 'node:assert'
import { CreateAutoscalingDto } from './dto/create-autoscaling.dto'

@Injectable()
export class AutoscalingService {
  private readonly db = SystemDatabase.db
  private readonly logger = new Logger(AutoscalingService.name)

  async update(appid: string, dto: CreateAutoscalingDto) {
    const autoscaling = {
      minReplicas: 1,
      maxReplicas: 5,
      targetCPUUtilizationPercentage: null,
      targetMemoryUtilizationPercentage: null,
      ...dto,
    }

    const res = await this.db
      .collection<ApplicationConfiguration>('ApplicationConfiguration')
      .findOneAndUpdate(
        { appid },
        { $set: { autoscaling, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    assert(res?.value, 'application configuration not found')
    return res.value.autoscaling
  }

  async findOne(appid: string) {
    const doc = await this.db
      .collection<ApplicationConfiguration>('ApplicationConfiguration')
      .findOne({ appid })

    return doc.autoscaling
  }
}
