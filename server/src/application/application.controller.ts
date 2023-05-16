import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Logger,
  Post,
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
import { CreateApplicationDto } from './dto/create-application.dto'
import { AccountService } from 'src/account/account.service'
import { ApplicationPhase, ApplicationState } from './entities/application'
import { SystemDatabase } from 'src/database/system-database'
import { Runtime } from './entities/runtime'
import { ObjectId } from 'mongodb'

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
    private readonly accountService: AccountService,
  ) {}

  /**
   * Create application
   */
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create application' })
  @Post()
  async create(@Req() req: IRequest, @Body() dto: CreateApplicationDto) {
    const user = req.user

    // check regionId exists
    const region = await this.regionService.findOneDesensitized(
      new ObjectId(dto.regionId),
    )
    if (!region) {
      return ResponseUtil.error(`region ${dto.regionId} not found`)
    }

    // check runtimeId exists
    const runtime = await SystemDatabase.db
      .collection<Runtime>('Runtime')
      .findOne({ _id: new ObjectId(dto.runtimeId) })
    if (!runtime) {
      return ResponseUtil.error(`runtime ${dto.runtimeId} not found`)
    }

    // check account balance
    const account = await this.accountService.findOne(user.id)
    const balance = account?.balance || 0
    if (balance <= 0) {
      return ResponseUtil.error(`account balance is not enough`)
    }

    // create application
    const appid = await this.appService.tryGenerateUniqueAppid()
    await this.appService.create(user.id, appid, dto)

    const app = await this.appService.findOne(appid)
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
    const data = await this.appService.findOne(appid)

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

    // check if the corresponding subscription status has expired
    const app = await this.appService.findOne(appid)

    // check: only running application can restart
    if (
      dto.state === ApplicationState.Restarting &&
      app.state !== ApplicationState.Running &&
      app.phase !== ApplicationPhase.Started
    ) {
      return ResponseUtil.error(
        'The application is not running, can not restart it',
      )
    }

    // check: only running application can stop
    if (
      dto.state === ApplicationState.Stopped &&
      app.state !== ApplicationState.Running &&
      app.phase !== ApplicationPhase.Started
    ) {
      return ResponseUtil.error(
        'The application is not running, can not stop it',
      )
    }

    // check: only stopped application can start
    if (
      dto.state === ApplicationState.Running &&
      app.state !== ApplicationState.Stopped &&
      app.phase !== ApplicationPhase.Stopped
    ) {
      return ResponseUtil.error(
        'The application is not stopped, can not start it',
      )
    }

    // update app
    const doc = await this.appService.update(appid, dto)
    if (!doc) {
      return ResponseUtil.error('update application error')
    }
    return ResponseUtil.ok(doc)
  }
}
