import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common'
import { AppsService } from './apps.service'
import { CreateAppDto } from './dto/create-app.dto'
import { UpdateAppDto } from './dto/update-app.dto'
import { ResponseUtil } from '../utils/response'

@Controller('apps')
export class AppsController {
  private readonly logger = new Logger(AppsController.name)
  constructor(private readonly appsService: AppsService) {}

  /**
   * Create application
   * @returns
   */
  @Post()
  async create(@Body() dto: CreateAppDto) {
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // create namespace
    const appid = this.appsService.generateAppid(6)
    const namespace = await this.appsService.createAppNamespace(appid)
    if (!namespace) {
      return ResponseUtil.error('create app namespace error')
    }

    // create app
    const app = await this.appsService.create(appid, dto)
    if (!app) {
      return ResponseUtil.error('create app error')
    }
    return ResponseUtil.ok(app)
  }

  @Get()
  findAll() {
    return this.appsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appsService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppDto: UpdateAppDto) {
    return this.appsService.update(+id, updateAppDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appsService.remove(+id)
  }
}
