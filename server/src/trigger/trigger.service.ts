import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { AgendaService } from './agenda.service'
import { CreateTriggerDto } from './dto/create-trigger.dto'

@Injectable()
export class TriggerService {
  private readonly logger = new Logger(TriggerService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly agenda: AgendaService,
  ) {}

  async create(appid: string, dto: CreateTriggerDto) {
    const { desc, cron, target } = dto
    const trigger = await this.prisma.cronTrigger.create({
      data: {
        desc,
        cron,
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

    await this.agenda.createJob(trigger)
    return trigger
  }

  async findAll(appid: string) {
    const res = await this.prisma.cronTrigger.findMany({
      where: { appid },
    })

    return res
  }

  async remove(appid: string, id: string) {
    const res = await this.prisma.cronTrigger.deleteMany({
      where: { appid, id },
    })

    await this.agenda.removeJob(id)
    return res
  }
}
