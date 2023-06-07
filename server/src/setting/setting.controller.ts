import { Controller, Get, Logger, Param } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { SettingService } from './setting.service'

@ApiTags('Public')
@Controller('settings')
export class SettingController {
  private readonly logger = new Logger(SettingController.name)

  constructor(private readonly settingService: SettingService) {}

  /**
   * Get site settings
   */
  @ApiOperation({ summary: 'Get site settings' })
  @Get()
  async getSettings() {
    const data = await this.settingService.findAllPublic()
    return ResponseUtil.ok(data)
  }

  /**
   * Get one site setting by key
   */
  @ApiOperation({ summary: 'Get one site setting by key' })
  @Get(':key')
  async getSettingByKey(@Param('key') key: string) {
    const data = await this.settingService.findOnePublic(key)
    if (!data) {
      return ResponseUtil.error('Setting not found')
    }
    return ResponseUtil.ok(data)
  }
}
