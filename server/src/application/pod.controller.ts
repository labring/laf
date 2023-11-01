import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApiResponseArray, ResponseUtil } from 'src/utils/response'
import { PodNamesDto } from './dto/pod.dto'
import { PodService } from './pod.service'

@ApiTags('Application')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/pods')
export class PodController {
  private readonly logger = new Logger(PodController.name)

  constructor(private readonly podService: PodService) {}

  /**
   * Get app all pod name
   * @param appid
   * @returns
   */
  @ApiResponseArray(PodNamesDto)
  @ApiOperation({ summary: 'Get app all pod name' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async get(@Param('appid') appid: string) {
    const podNames: PodNamesDto = await this.podService.getPodNameByAppid(appid)
    return ResponseUtil.ok(podNames)
  }
}
