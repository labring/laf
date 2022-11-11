import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { AppsService } from './apps.service'
import { CreateAppDto } from './dto/create-app.dto'
import { UpdateAppDto } from './dto/update-app.dto'
import { ResponseStruct } from '../utils/response'

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  /**
   * Create application
   * @returns
   */
  @Post()
  create(@Body() dto: CreateAppDto) {
    const error = dto.validate()
    if (error) {
      return ResponseStruct.error(error)
    }
    return this.appsService.create(dto)
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
