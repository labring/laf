import { Module, Global } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import SettingsService from '../settings/settings.service'

@Global()
@Module({
  controllers: [],
  providers: [SettingsService, PrismaService],
  exports: [SettingsService],
})
export class SettingsModule {}
