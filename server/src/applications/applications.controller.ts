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
import { ApiTags } from '@nestjs/swagger'
import { IRequest } from 'src/common/types'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ApiResponseUtil, ResponseUtil } from '../common/response'
import { ApplicationAuthGuard } from './application.auth.guard'
import { ApplicationsService } from './applications.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { Application, ApplicationList } from './entities/application.entity'

@ApiTags('Application')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly appService: ApplicationsService) {}

  /**
   * Create application
   * @returns
   */
  @ApiResponseUtil(Application)
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
    const namespace = await this.appService.createAppNamespace(user.id, appid)
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

  @ApiResponseUtil(ApplicationList)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: IRequest) {
    const user = req.user
    const data = this.appService.findAllByUser(user.id)
    return ResponseUtil.ok(data)
  }

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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.appService.update(+id, updateApplicationDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appService.remove(+id)
  }
}
