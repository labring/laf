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
import { ApplicationAuthGuard } from '../applications/application.auth.guard'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ApiResponseUtil, ResponseUtil } from '../common/response'
import { CollectionsService } from './collections.service'
import { CreateCollectionDto } from './dto/create-collection.dto'
import { UpdateCollectionDto } from './dto/update-collection.dto'
import { Collection } from './entities/collection.entity'

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

  /**
   * Get collection list of an application
   * @param appid
   * @returns
   */
  @ApiResponseUtil(Collection) // QUIRKS: should be array but swagger doesn't support it
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async findAll(@Param('appid') appid: string) {
    const collections = await this.collectionService.findAll(appid)
    if (collections === null) {
      return ResponseUtil.error('failed to get collections')
    }
    return ResponseUtil.ok(collections)
  }

  @ApiResponseUtil(Collection)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':name')
  async findOne(@Param('appid') appid: string, @Param('name') name: string) {
    const res = await this.collectionService.findOne(appid, name)
    if (!res) {
      return ResponseUtil.error('failed to get collection')
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Update a collection by its name
   * @param appid
   * @param name
   * @param dto
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':name')
  async update(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    const res = await this.collectionService.update(appid, name, dto)
    if (res === false) {
      return ResponseUtil.error('failed to update collection')
    }

    return ResponseUtil.ok(res)
  }

  /**
   * Delete a collection by its name
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete(':name')
  async remove(@Param('appid') appid: string, @Param('name') name: string) {
    const res = await this.collectionService.remove(appid, name)
    if (res === false) {
      return ResponseUtil.error('failed to delete collection')
    }
    return ResponseUtil.ok(res)
  }
}
