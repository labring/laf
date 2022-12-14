import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { FunctionService } from '../function/function.service'
import { ResponseUtil } from '../utils/response'

@ApiBearerAuth('Authorization')
@Controller('apps/:appid/logs')
export class LogController {
  private readonly logger = new Logger(LogController.name)

  constructor(private readonly funcService: FunctionService) {}

  /**
   * Get function logs
   * @param appid
   * @param name
   * @returns
   */
  @ApiTags('Function')
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get function logs' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @ApiQuery({
    name: 'functionName',
    type: String,
    description: 'The function name. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'requestId',
    type: String,
    description: 'The request id. Optional',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    type: String,
    description: 'The page number, default is 1',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: String,
    description: 'The limit number, default is 10',
    required: false,
  })
  @Get('functions')
  async getLogs(
    @Param('appid') appid: string,
    @Query('requestId') requestId?: string,
    @Query('functionName') functionName?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    page = page || 1
    limit = limit || 10

    const res = await this.funcService.findLogs(appid, {
      requestId,
      functionName,
      limit,
      page,
    })

    return ResponseUtil.ok({
      list: res.data,
      total: res.total,
      page,
      limit,
    })
  }
}
