import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { ResponseUtil } from 'src/utils/response'
import { EnvironmentVariableService } from './environment.service'
import { CreateEnvironmentDto } from './dto/create-env.dto'

@ApiTags('Application')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/environments')
export class EnvironmentVariableController {
  private readonly logger = new Logger(EnvironmentVariableController.name)

  constructor(private readonly confService: EnvironmentVariableService) {}

  /**
   * Set a environment variable
   * @param appid
   * @param dto
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Set a environment variable (create/update)' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async add(@Param('appid') appid: string, @Body() dto: CreateEnvironmentDto) {
    const res = await this.confService.set(appid, dto)
    return ResponseUtil.ok(res)
  }

  /**
   * Get environment variables
   * @param appid
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get environment variables' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async get(@Param('appid') appid: string) {
    const res = await this.confService.find(appid)
    return ResponseUtil.ok(res)
  }

  /**
   * Delete an environment variable by name
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Delete an environment variable by name' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete(':name')
  async delete(@Param('appid') appid: string, @Param('name') name: string) {
    const res = await this.confService.delete(appid, name)
    return ResponseUtil.ok(res)
  }
}
