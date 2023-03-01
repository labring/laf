import { Module } from '@nestjs/common'
import SmsController from './sms.controller'
import SmsService from './sms.service'
import SettingsService from '../settings/settings.service'

@Module({
  controllers: [SmsController],
  providers: [SmsService, SettingsService],
  exports: [SmsService],
})
export class SmsModule {}
