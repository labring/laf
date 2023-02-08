import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { WebsitesService } from './websites.service'
import { CreateWebsiteDto } from './dto/create-website.dto'
import { UpdateWebsiteDto } from './dto/update-website.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Website')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/websites')
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Post()
  @ApiOperation({ summary: 'TODO - ⌛️' })
  create(@Body() createWebsiteDto: CreateWebsiteDto) {
    return this.websitesService.create(createWebsiteDto)
  }

  @Get()
  @ApiOperation({ summary: 'TODO - ⌛️' })
  findAll() {
    return this.websitesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'TODO - ⌛️' })
  findOne(@Param('id') id: string) {
    return this.websitesService.findOne(+id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'TODO - ⌛️' })
  update(@Param('id') id: string, @Body() updateWebsiteDto: UpdateWebsiteDto) {
    return this.websitesService.update(+id, updateWebsiteDto)
  }

  @ApiOperation({ summary: 'TODO - ⌛️' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.websitesService.remove(+id)
  }
}
