import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApiResponseObject, ResponseUtil } from 'src/utils/response'
import { ContainerNameListDto, PodNameListDto } from './dto/pod.dto'
import { PodService } from './pod.service'

@ApiTags('Application')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/pod')
export class PodController {
  private readonly logger = new Logger(PodController.name)

  constructor(private readonly podService: PodService) {}

  /**
   * Get app all pod name
   * @param appid
   * @returns
   */
  @ApiResponseObject(PodNameListDto)
  @ApiOperation({ summary: 'Get app all pod name' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async getPodNameList(@Param('appid') appid: string) {
    const podNames: PodNameListDto =
      await this.podService.getPodNameListByAppid(appid)
    return ResponseUtil.ok(podNames)
  }

  /**
   * Get pod's containers
   * @param appid
   * @returns
   */
  @ApiResponseObject(ContainerNameListDto)
  @ApiOperation({ summary: "Get pod's containers" })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get('container')
  async getContainerNameList(
    @Param('appid') appid: string,
    @Query('podName') podName: string,
  ) {
    if (!podName) {
      return ResponseUtil.error('no podName')
    }
    const podNames: PodNameListDto =
      await this.podService.getPodNameListByAppid(appid)

    if (!podNames.podNameList.includes(podName)) {
      return ResponseUtil.error('podName not exist')
    }

    const containerNames: ContainerNameListDto =
      await this.podService.getContainerNameListByPodName(appid, podName)
    return ResponseUtil.ok(containerNames)
  }
}
