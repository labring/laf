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
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ApiResponseUtil, ResponseUtil } from '../common/response'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { ApplicationsService } from './applications.service'
import { ApplicationCoreService } from 'src/core/application.cr.service'

@ApiTags('Application')
@Controller('applications')
@ApiBearerAuth('Authorization')
export class ApplicationsController {
  constructor(
    private readonly appService: ApplicationsService,
    private readonly appCoreService: ApplicationCoreService,
  ) {}

  /**
   * Create application
   * @returns
   */
  // @ApiResponseUtil(Application)
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
    const appid = this.appCoreService.generateAppid(6)
    const namespace = await this.appCoreService.createAppNamespace(
      appid,
      user.id,
    )
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
  // @ApiResponseUtil(ApplicationList)
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
  async findOne(@Param('appid') appid: string) {
    const data = await this.appService.findOne(appid)
    if (null === data) {
      throw new HttpException('application not found', HttpStatus.NOT_FOUND)
    }

    const resource = await this.appCoreService.findOne(appid)
    const res = {
      ...data,
      resource,
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Update an application
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'Update an application' })
  // @ApiResponseUtil(Application)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':appid')
  async update(
    @Param('appid') appid: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    // check dto
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // update app
    const res = await this.appService.update(appid, dto)
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
  async remove(@Param('appid') appid: string) {
    const res = await this.appService.remove(appid)
    if (res === null) {
      return ResponseUtil.error('delete application error')
    }
    return ResponseUtil.ok(res)
  }
}
