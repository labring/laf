import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseUtil } from 'src/utils/response'
import { AutoscalingService } from './autoscaling.service'
import { CreateAutoscalingDto } from './dto/create-autoscaling.dto'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'

@ApiTags('Application')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/autoscaling')
export class AutoscalingController {
  private readonly logger = new Logger(AutoscalingController.name)

  constructor(private readonly autoScalingService: AutoscalingService) {}

  /**
   * Update autoscaling setting
   * @param appid
   * @param dto
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Update autoscaling setting' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch()
  @ApiBody({
    type: CreateAutoscalingDto,
    description: 'The autoscaling params',
  })
  async update(
    @Param('appid') appid: string,
    @Body() dto: CreateAutoscalingDto,
  ) {
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }
    const res = await this.autoScalingService.update(appid, dto)
    return ResponseUtil.ok(res)
  }

  /**
   * Get autoscaling setting
   * @param appid
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get autoscaling setting' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async get(@Param('appid') appid: string) {
    const res = await this.autoScalingService.findOne(appid)
    return ResponseUtil.ok(res)
  }
}
