import { Module, Global } from '@nestjs/common'
import SettingsService from '../settings/settings.service'

@Global()
@Module({
  controllers: [],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
