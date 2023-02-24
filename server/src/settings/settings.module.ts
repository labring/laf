import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import SettingsService from '../settings/settings.service'

@Module({
  controllers: [],
  providers: [SettingsService, PrismaService],
  exports: [SettingsService],
})
export class SettingsModule {}
