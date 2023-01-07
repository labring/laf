import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateEnvironmentDto } from './dto/create-env.dto'

@Injectable()
export class EnvironmentVariableService {
  private readonly logger = new Logger(EnvironmentVariableService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * if exists, update, else create
   * @param appid
   * @param dto
   */
  async set(appid: string, dto: CreateEnvironmentDto) {
    const origin = await this.find(appid)
    // check if exists
    const exists = origin.find((item) => item.name === dto.name)
    if (exists) {
      exists.value = dto.value
    } else {
      origin.push(dto)
    }

    const res = await this.prisma.applicationConfiguration.update({
      where: { appid },
      data: {
        environments: {
          set: origin,
        },
      },
    })

    return res.environments
  }

  async find(appid: string) {
    const res = await this.prisma.applicationConfiguration.findUnique({
      where: {
        appid,
      },
    })

    return res.environments
  }

  async delete(appid: string, name: string) {
    const res = await this.prisma.applicationConfiguration.update({
      where: {
        appid,
      },
      data: {
        environments: {
          deleteMany: {
            where: {
              name,
            },
          },
        },
      },
    })

    return res
  }
}
