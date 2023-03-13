import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { IRequest } from '../utils/interface'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ResponseUtil } from '../utils/response'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { ApplicationService } from './application.service'
import { FunctionService } from '../function/function.service'
import { StorageService } from 'src/storage/storage.service'
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
    private readonly storageService: StorageService,
  ) {}

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

    // SECURITY ALERT!!!
    // DO NOT response this region object to client since it contains sensitive information
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
}
