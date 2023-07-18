import { Injectable } from '@nestjs/common'
import { SettingService } from 'src/setting/setting.service'

@Injectable()
export class ReleaseService {
  constructor(private readonly settingService: SettingService) {}

  async getReleaseConfig() {
    const key = 'application_release_config'
    const res = await this.settingService.findOne(key)
    return res?.metadata || {}
  }
}
