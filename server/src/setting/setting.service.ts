import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SettingService {
  private readonly logger = new Logger(SettingService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.setting.findMany()
  }

  async findOne(key: string) {
    return await this.prisma.setting.findUnique({
      where: { key },
    })
  }
}
