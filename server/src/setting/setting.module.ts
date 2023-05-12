import { Module } from '@nestjs/common'
import { SettingService } from './setting.service'
import { SettingController } from './setting.controller'

@Module({
  providers: [SettingService],
  controllers: [SettingController],
})
export class SettingModule {}
