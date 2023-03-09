import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ApplicationConfigurationService {
  private readonly logger = new Logger(ApplicationConfigurationService.name)

  constructor(private readonly prisma: PrismaService) {}

  async count(appid: string) {
    return this.prisma.applicationConfiguration.count({
      where: {
        appid,
      },
    })
  }

  async remove(appid: string) {
    return this.prisma.applicationConfiguration.delete({
      where: {
        appid,
      },
    })
  }
}
