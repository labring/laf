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
import { IRequest } from '../utils/interface'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ResponseUtil } from '../utils/response'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { ApplicationService } from './application.service'
import { FunctionService } from '../function/function.service'
import { StorageService } from 'src/storage/storage.service'
import { RegionService } from 'src/region/region.service'
import { BundleService } from 'src/region/bundle.service'
import { PrismaService } from 'src/prisma/prisma.service'

@ApiTags('Application')
@Controller('applications')
@ApiBearerAuth('Authorization')
export class ApplicationController {
  private logger = new Logger(ApplicationController.name)
  constructor(
    private readonly appService: ApplicationService,
    private readonly funcService: FunctionService,
    private readonly regionService: RegionService,
    private readonly storageService: StorageService,
    private readonly bundleService: BundleService,
    private readonly prisma: PrismaService,
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

    // check app count limit
    const bundle = await this.bundleService.findOne(dto.bundleId)
    const LIMIT_COUNT = bundle?.resource?.limitCountPerUser || 0
    const count = await this.prisma.application.count({
      where: {
        createdBy: user.id,
        bundle: {
          id: dto.bundleId,
        },
      },
    })
    if (count >= LIMIT_COUNT) {
      return ResponseUtil.error(
        `application count limit is ${LIMIT_COUNT} for bundle ${bundle.name}`,
      )
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
    const data = await this.appService.findOne(appid, {
      configuration: true,
      domain: true,
    })

    // [SECURITY ALERT] Do NOT response this region object to client since it contains sensitive information
    const region = await this.regionService.findOne(data.regionId)

    // TODO: remove these storage related code to standalone api
    let storage = {}
    const storageUser = await this.storageService.findOne(appid)
    if (storageUser) {
      const sts = await this.storageService.getOssSTS(
        region,
        appid,
        storageUser,
      )
      const credentials = {
        endpoint: region.storageConf.externalEndpoint,
        accessKeyId: sts.Credentials?.AccessKeyId,
        secretAccessKey: sts.Credentials?.SecretAccessKey,
        sessionToken: sts.Credentials?.SessionToken,
        expiration: sts.Credentials?.Expiration,
      }

      storage = {
        credentials,
        ...storageUser,
      }
    }

    // Generate the develop token, it's provided to the client when debugging function
    const expires = 60 * 60 * 24 * 7
    const develop_token = await this.funcService.generateRuntimeToken(
      appid,
      'develop',
      expires,
    )

    const res = {
      ...data,
      storage: storage,
      port: region.gatewayConf.port,
      develop_token: develop_token,

      /** This is the redundant field of Region */
      tls: region.tls,

      /** @deprecated alias of develop token, will be remove in future  */
      function_debug_token: develop_token,
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
