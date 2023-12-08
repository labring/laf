import { Controller, Get, UseGuards } from '@nestjs/common'
import { DedicatedDatabaseMonitorService } from './monitor.service'
import { InjectApplication } from 'src/utils/decorator'
import { ApplicationWithRelations } from 'src/application/entities/application'
import { RegionService } from 'src/region/region.service'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'

@ApiTags('Database')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/dedicated-database/monitor')
export class DedicatedDatabaseMonitorController {
  constructor(
    private readonly region: RegionService,
    private readonly monitor: DedicatedDatabaseMonitorService,
  ) {}

  @ApiOperation({
    summary: 'Get dedicated database resources metrics data',
  })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get('resource')
  async getResource(@InjectApplication() app: ApplicationWithRelations) {
    const region = await this.region.findOne(app.regionId)
    const res = await this.monitor.getResource(app.appid, region)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Get dedicated database connections metrics data' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get('connection')
  async getConnection(@InjectApplication() app: ApplicationWithRelations) {
    const region = await this.region.findOne(app.regionId)
    const res = await this.monitor.getConnection(app.appid, region)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Get dedicated database performance metrics data' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get('performance')
  async getPerformance(@InjectApplication() app: ApplicationWithRelations) {
    const region = await this.region.findOne(app.regionId)
    const res = await this.monitor.getPerformance(app.appid, region)
    return ResponseUtil.ok(res)
  }
}
