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
import { FunctionService } from '../function/function.service'
import { StorageService } from 'src/storage/storage.service'
import { DatabaseCoreService } from 'src/core/database.cr.service'
import { GatewayCoreService } from 'src/core/gateway.cr.service'
import { RegionService } from 'src/region/region.service'

@ApiTags('Application')
@Controller('applications')
@ApiBearerAuth('Authorization')
export class ApplicationController {
  private logger = new Logger(ApplicationController.name)
  constructor(
    private readonly appService: ApplicationService,
    private readonly funcService: FunctionService,
    private readonly regionService: RegionService,
    private readonly databaseCore: DatabaseCoreService,
    private readonly gatewayCore: GatewayCoreService,
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
    const database = await this.databaseCore.findOne(appid)
    const gateway = await this.gatewayCore.findOne(appid)
    const storage = await this.storageService.findOne(appid)

    const data = await this.appService.findOne(appid, {
      configuration: true,
    })

    // Security Warning: Do not response this region object to client since it contains sensitive information
    const region = await this.regionService.findOne(data.regionName)

    const sts = await this.storageService.getOssSTS(region, appid, storage)
    const credentials = {
      endpoint: region.storageConf.externalEndpoint,
      accessKeyId: sts.Credentials?.AccessKeyId,
      secretAccessKey: sts.Credentials?.SecretAccessKey,
      sessionToken: sts.Credentials?.SessionToken,
      expiration: sts.Credentials?.Expiration,
    }

    const debug_token = await this.funcService.getDebugFunctionToken(appid)

    const res = {
      ...data,
      gateway,
      database,
      storage: {
        ...storage,
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
