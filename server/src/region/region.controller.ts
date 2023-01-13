import { Controller, Get, Logger } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from '../utils/response'
import { RegionService } from './region.service'

@ApiTags('Public')
@Controller('regions')
export class RegionController {
  private readonly logger = new Logger(RegionController.name)
  constructor(private readonly regionService: RegionService) {}

  /**
   * Get region list
   * @returns
   */
  @ApiOperation({ summary: 'Get region list' })
  @Get()
  async getRegions() {
    const data = await this.regionService.findAllDesensitized()
    return ResponseUtil.ok(data)
  }
}
