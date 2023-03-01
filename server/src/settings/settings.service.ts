import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export default class SettingsService {
  private logger = new Logger(SettingsService.name)
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(key: string): Promise<string> {
    const config = await this.prisma.settings.findUnique({
      where: { key },
    })
    return config?.value || ''
  }
}
