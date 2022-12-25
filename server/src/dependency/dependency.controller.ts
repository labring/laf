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
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ResponseUtil } from '../utils/response'
import { DependencyService } from './dependency.service'
import { CreateDependencyDto } from './dto/create-dependency.dto'

@ApiTags('Application')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/dependencies')
export class DependencyController {
  private readonly logger = new Logger(DependencyController.name)

  constructor(private readonly depsService: DependencyService) {}

  /**
   * Add a dependency to an app
   * @param appid
   * @param dto
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Add a dependency' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  @ApiBody({ type: [CreateDependencyDto] })
  async add(@Param('appid') appid: string, @Body() dto: CreateDependencyDto[]) {
    const res = await this.depsService.add(appid, dto)
    return ResponseUtil.ok(res)
  }

  /**
   * Get application dependencies
   * @param appid
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get application dependencies' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async getDependencies(@Param('appid') appid: string) {
    const res = await this.depsService.getMergedObjects(appid)
    return ResponseUtil.ok(res)
  }

  /**
   * Remove a dependency
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Remove a dependency' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete(':name')
  async remove(@Param('appid') appid: string, @Param('name') name: string) {
    const res = await this.depsService.remove(appid, name)
    return ResponseUtil.ok(res)
  }
}
