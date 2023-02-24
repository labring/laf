import { Module } from '@nestjs/common'
import { SettingsModule } from 'src/settings/settings.module'
import SmsController from './sms.controller'
import SmsService from './sms.service'
import SettingsService from '../settings/settings.service'
import { PrismaService } from '../prisma.service'

@Module({
  imports: [SettingsModule],
  controllers: [SmsController],
  providers: [SmsService, SettingsService, PrismaService],
  exports: [SmsService],
})
export class SmsModule {}
