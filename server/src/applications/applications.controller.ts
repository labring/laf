import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { ResponseUtil } from 'src/utils/response'
import { ApplicationsService } from './applications.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly appService: ApplicationsService) {}

  /**
   * Create application
   * @returns
   */
  @Post()
  async create(@Body() dto: CreateApplicationDto) {
    const error = dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    // create namespace
    const appid = this.appService.generateAppid(6)
    const namespace = await this.appService.createAppNamespace(appid)
    if (!namespace) {
      return ResponseUtil.error('create app namespace error')
    }

    // create app
    const app = await this.appService.create(appid, dto)
    if (!app) {
      return ResponseUtil.error('create app error')
    }
    return ResponseUtil.ok(app)
  }

  @Get()
  findAll() {
    return this.appService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appService.findOne(+id)
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
