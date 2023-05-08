import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateEnvironmentDto } from './dto/create-env.dto'
import { ApplicationConfigurationService } from './configuration.service'

@Injectable()
export class EnvironmentVariableService {
  private readonly logger = new Logger(EnvironmentVariableService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly confService: ApplicationConfigurationService,
  ) {}

  async updateAll(appid: string, dto: CreateEnvironmentDto[]) {
    const res = await this.prisma.applicationConfiguration.update({
      where: { appid },
      data: { environments: { set: dto } },
    })

    await this.confService.publish(res)
    return res.environments
  }

  /**
   * if exists, update, else create
   * @param appid
   * @param dto
   */
  async setOne(appid: string, dto: CreateEnvironmentDto) {
    const origin = await this.findAll(appid)
    // check if exists
    const exists = origin.find((item) => item.name === dto.name)
    if (exists) {
      exists.value = dto.value
    } else {
      origin.push(dto)
    }

    const res = await this.prisma.applicationConfiguration.update({
      where: { appid },
      data: { environments: { set: origin } },
    })

    await this.confService.publish(res)
    return res.environments
  }

  async findAll(appid: string) {
    const res = await this.prisma.applicationConfiguration.findUnique({
      where: { appid },
    })

    return res.environments
  }

  async deleteOne(appid: string, name: string) {
    const res = await this.prisma.applicationConfiguration.update({
      where: { appid },
      data: { environments: { deleteMany: { where: { name } } } },
    })

    await this.confService.publish(res)
    return res
  }
}
