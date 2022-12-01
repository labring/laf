import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { IRequest } from '../common/types'
import { ApplicationCoreService } from '../core/application.cr.service'
import { Application, ApplicationList } from '../core/api/application.cr'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ApiResponseUtil, ResponseUtil } from '../common/response'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'

@ApiTags('Application')
@Controller('applications')
@ApiBearerAuth('Authorization')
export class ApplicationsController {
  constructor(private readonly appService: ApplicationCoreService) {}

  /**
   * Create application
   * @returns
   */
  @ApiResponseUtil(Application)
  @ApiOperation({ summary: 'Create a new application' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateApplicationDto, @Req() req: IRequest) {
    const user = req.user
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // create namespace
    const appid = this.appService.generateAppid(6)
    const namespace = await this.appService.createAppNamespace(appid, user.id)
    if (!namespace) {
      return ResponseUtil.error('create app namespace error')
    }

    // create app
    const app = await this.appService.create(user.id, appid, dto)
    if (!app) {
      return ResponseUtil.error('create app error')
    }
    return ResponseUtil.ok(app)
  }

  /**
   * Get user application list
   * @param req
   * @returns
   */
  @ApiResponseUtil(ApplicationList)
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get user application list' })
  async findAll(@Req() req: IRequest) {
    const user = req.user
    const data = await this.appService.findAllByUser(user.id)
    return ResponseUtil.ok(data)
  }

  /**
   * Get an application by appid
   * @param appid
   * @param req
   * @returns
   */
  @ApiOperation({ summary: 'Get an application by appid' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':appid')
  async findOne(@Param('appid') appid: string, @Req() req: IRequest) {
    const user = req.user
    const data = await this.appService.findOneByUser(user.id, appid)
    if (null === data) {
      throw new HttpException('application not found', HttpStatus.NOT_FOUND)
    }

    return ResponseUtil.ok(data)
  }

  /**
   * Update an application
   * @param dto
   * @param req
   * @returns
   */
  @ApiOperation({ summary: 'Update an application' })
  @ApiResponseUtil(Application)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':appid')
  async update(
    @Param('appid') _appid: string,
    @Body() dto: UpdateApplicationDto,
    @Req() req: IRequest,
  ) {
    // check dto
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // update app
    const app = req.application
    const res = await this.appService.update(app, dto)
    if (res === null) {
      return ResponseUtil.error('update application error')
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Delete an application
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Delete an application' })
  @Delete(':appid')
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  async remove(@Param('appid') _appid: string, @Req() req: IRequest) {
    const app = req.application
    const res = await this.appService.remove(app)
    if (res === null) {
      return ResponseUtil.error('delete application error')
    }
    return ResponseUtil.ok(res)
  }
}
