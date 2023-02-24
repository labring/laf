import { Module } from '@nestjs/common'
import SmsController from './sms.controller'
import SmsService from './sms.service'

@Module({
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
