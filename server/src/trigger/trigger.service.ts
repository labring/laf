import { Injectable, Logger } from '@nestjs/common'
import { TriggerPhase, TriggerState } from '@prisma/client'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTriggerDto } from './dto/create-trigger.dto'
import CronValidate from 'cron-validate'

@Injectable()
export class TriggerService {
  private readonly logger = new Logger(TriggerService.name)

  constructor(private readonly prisma: PrismaService) {}

  async create(appid: string, dto: CreateTriggerDto) {
    const { desc, cron, target } = dto
    const trigger = await this.prisma.cronTrigger.create({
      data: {
        desc,
        cron,
        state: TriggerState.Active,
        phase: TriggerPhase.Creating,
        lockedAt: TASK_LOCK_INIT_TIME,
        cloudFunction: {
          connect: {
            appid_name: {
              appid,
              name: target,
            },
          },
        },
      },
    })

    return trigger
  }

  async count(appid: string) {
    const res = await this.prisma.cronTrigger.count({
      where: { appid },
    })

    return res
  }

  async findAll(appid: string) {
    const res = await this.prisma.cronTrigger.findMany({
      where: { appid },
    })

    return res
  }

  async remove(id: string) {
    const res = await this.prisma.cronTrigger.update({
      where: { id },
      data: {
        state: TriggerState.Deleted,
      },
    })
    return res
  }

  async removeAll(appid: string) {
    const res = await this.prisma.cronTrigger.updateMany({
      where: { appid },
      data: {
        state: TriggerState.Deleted,
      },
    })
    return res
  }

  isValidCronExpression(cron: string) {
    const ret = CronValidate(cron)
    if (ret.isValid()) {
      return true
    }

    return false
  }
}
