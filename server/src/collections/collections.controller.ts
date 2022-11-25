import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApplicationAuthGuard } from 'src/applications/application.auth.guard'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ResponseUtil } from 'src/common/response'
import { CollectionsService } from './collections.service'
import { CreateCollectionDto } from './dto/create-collection.dto'
import { UpdateCollectionDto } from './dto/update-collection.dto'

@ApiTags('Database')
@Controller('apps/:appid/collections')
export class CollectionsController {
  private readonly logger = new Logger(CollectionsController.name)
  constructor(private readonly collectionService: CollectionsService) {}

  /**
   * Create a new collection in database
   * @param appid
   * @param dto
   * @returns
   */
  @ApiResponse({ type: ResponseUtil<boolean> })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(
    @Param('appid') appid: string,
    @Body() dto: CreateCollectionDto,
  ) {
    const error = await dto.validate()
    if (error) {
      return ResponseUtil.error(error)
    }

    const ok = await this.collectionService.create(appid, dto)
    if (ok) {
      return ResponseUtil.ok(ok)
    }
    return ResponseUtil.error('failed to create collection')
  }

  @Get()
  findAll() {
    return this.collectionService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionService.update(+id, updateCollectionDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionService.remove(+id)
  }
}
