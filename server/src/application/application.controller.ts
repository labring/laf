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
  Logger,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { IRequest } from '../utils/types'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ResponseUtil } from '../utils/response'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { ApplicationService } from './application.service'
import { ServerConfig } from '../constants'
import { FunctionsService } from '../function/functions.service'
import { StorageService } from '../storage/storage.service'

@ApiTags('Application')
@Controller('applications')
@ApiBearerAuth('Authorization')
export class ApplicationController {
  private logger = new Logger(ApplicationController.name)
  constructor(
    private readonly appService: ApplicationService,
    private readonly funcService: FunctionsService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Create application
   * @returns
   */
  @ApiOperation({ summary: 'Create a new application' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateApplicationDto, @Req() req: IRequest) {
    const user = req.user
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // create app
    const app = await this.appService.create(user.id, dto)
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
   * @returns
   */
  @ApiOperation({ summary: 'Get an application by appid' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':appid')
  async findOne(@Param('appid') appid: string) {
    // get sub resources
    const resources = await this.appService.getSubResources(appid)

    const data = await this.appService.findOne(appid, { configuration: true })
    const sts = await this.storageService.getOssSTS(appid, resources.oss)
    const credentials = {
      endpoint: ServerConfig.OSS_ENDPOINT,
      accessKeyId: sts.Credentials?.AccessKeyId,
      secretAccessKey: sts.Credentials?.SecretAccessKey,
      sessionToken: sts.Credentials?.SessionToken,
      expiration: sts.Credentials?.Expiration,
    }

    const debug_token = await this.funcService.getDebugFunctionToken(appid)
    const res = {
      ...data,
      gateway: resources.gateway,
      database: resources.database,
      oss: {
        ...resources.oss,
        credentials,
      },
      function_debug_token: debug_token,
    }

    return ResponseUtil.ok(res)
  }

  /**
   * Update an application
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'Update an application' })
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
      this.logger.error('delete application error')
      return ResponseUtil.error('delete application error')
    }

    return ResponseUtil.ok(res)
  }
}
