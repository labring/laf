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
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApplicationAuthGuard } from 'src/applications/application.auth.guard'
import { IRequest } from 'src/common/types'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ApiResponseUtil, ResponseUtil } from '../common/response'
import { BucketsService } from './buckets.service'
import { CreateBucketDto } from './dto/create-bucket.dto'
import { UpdateBucketDto } from './dto/update-bucket.dto'
import { Bucket, BucketList } from './entities/bucket.entity'

@ApiTags('Bucket')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/buckets')
export class BucketsController {
  logger = new Logger(BucketsController.name)
  constructor(private readonly bucketsService: BucketsService) {}

  /**
   * Create a new bucket
   * @param dto
   * @param req
   * @returns
   */
  @ApiResponseUtil(Bucket)
  @ApiOperation({ summary: 'Create a new bucket' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(
    @Param('appid') appid: string,
    @Body() dto: CreateBucketDto,
    @Req() req: IRequest,
  ) {
    // check if the bucket name is unique

    const found = await this.bucketsService.findOne(appid, dto.fullname(appid))
    if (found) {
      return ResponseUtil.error('bucket name is already existed')
    }

    // TODO: check the storage capacity of the app
    const app = req.application
    this.logger.warn(
      'TODO: check the storage capacity of the app: ',
      app.metadata.name,
    )

    // create bucket
    const bucket = await this.bucketsService.create(appid, dto)
    if (!bucket) {
      return ResponseUtil.error('create bucket failed')
    }

    return ResponseUtil.ok(bucket)
  }

  /**
   * Get bucket list of an app
   * @param appid
   * @returns
   */
  @ApiResponseUtil(BucketList)
  @ApiOperation({ summary: 'Get bucket list of an app' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async findAll(@Param('appid') appid: string) {
    const data = await this.bucketsService.findAll(appid)
    return ResponseUtil.ok<BucketList>(data)
  }

  /**
   * Get a bucket by name
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponseUtil(Bucket)
  @ApiOperation({ summary: 'Get a bucket by name' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':name')
  async findOne(@Param('appid') appid: string, @Param('name') name: string) {
    const data = await this.bucketsService.findOne(appid, name)
    if (null === data) {
      throw new HttpException('bucket not found', HttpStatus.NOT_FOUND)
    }
    return ResponseUtil.ok(data)
  }

  /**
   * Update a bucket
   * @param appid
   * @param name  bucket name
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'Update a bucket' })
  @ApiResponseUtil(Bucket)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':name')
  async update(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: UpdateBucketDto,
  ) {
    const bucket = await this.bucketsService.findOne(appid, name)
    if (!bucket) {
      throw new HttpException('bucket not found', HttpStatus.NOT_FOUND)
    }

    // TODO check the storage capacity of the app

    const res = await this.bucketsService.update(bucket, dto)
    if (null === res) {
      return ResponseUtil.error('update bucket failed')
    }
    return ResponseUtil.ok(res)
  }

  /**
   * Delete a bucket
   * @param appid
   * @param name bucket name
   * @returns
   */
  @ApiResponseUtil(Bucket)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @ApiOperation({ summary: 'Delete a bucket' })
  @Delete(':name')
  async remove(@Param('appid') appid: string, @Param('name') name: string) {
    const bucket = await this.bucketsService.findOne(appid, name)
    if (!bucket) {
      throw new HttpException('bucket not found', HttpStatus.NOT_FOUND)
    }

    const res = await this.bucketsService.remove(bucket)
    if (null === res) {
      return ResponseUtil.error('delete bucket failed')
    }
    return ResponseUtil.ok(res)
  }
}
