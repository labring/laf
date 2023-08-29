import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { MonitorService } from './monitor.service'
import { ResponseUtil } from 'src/utils/response'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { QueryMetricsDto } from './dto/query-metrics.dto'

@ApiTags('Monitor')
@ApiBearerAuth('Authorization')
@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @ApiOperation({ summary: 'Get monitor metrics data' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':appid/metrics')
  async getData(@Param('appid') appid: string, @Query() dto: QueryMetricsDto) {
    const { q: metrics, step, type } = dto
    const isRange = type === 'range'

    const res = await this.monitorService.getData(
      appid,
      metrics,
      {
        step,
      },
      isRange,
    )

    return ResponseUtil.ok(res)
  }
}
