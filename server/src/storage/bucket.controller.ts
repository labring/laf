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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { IRequest } from '../utils/interface'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { ResponseUtil } from '../utils/response'
import { CreateBucketDto } from './dto/create-bucket.dto'
import { UpdateBucketDto } from './dto/update-bucket.dto'
import { BucketService } from './bucket.service'
import { BundleService } from 'src/region/bundle.service'

@ApiTags('Storage')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/buckets')
export class BucketController {
  private readonly logger = new Logger(BucketController.name)

  constructor(
    private readonly bucketService: BucketService,
    private readonly bundleService: BundleService,
  ) {}

  /**
   * Create a new bucket
   * @param dto
   * @param req
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Create a new bucket' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(
    @Param('appid') appid: string,
    @Body() dto: CreateBucketDto,
    @Req() req: IRequest,
  ) {
    const app = req.application

    // check bucket count limit
    const bundle = await this.bundleService.findApplicationBundle(appid)
    const LIMIT_COUNT = bundle?.resource?.limitCountOfBucket || 0
    const count = await this.bucketService.count(appid)
    if (count >= LIMIT_COUNT) {
      return ResponseUtil.error(
        `bucket count limit exceeded, limit: ${LIMIT_COUNT}`,
      )
    }

    // check if the bucket name is unique
    const found = await this.bucketService.findOne(appid, dto.fullname(appid))
    if (found) {
      return ResponseUtil.error('bucket name is already existed')
    }

    // create bucket
    const bucket = await this.bucketService.create(app, dto)
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
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get bucket list of an app' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async findAll(@Param('appid') appid: string) {
    const data = await this.bucketService.findAll(appid)
    return ResponseUtil.ok(data)
  }

  /**
   * Get a bucket by name
   * @param appid
   * @param name
   * @returns
   */
  @ApiResponse({ type: ResponseUtil })
  @ApiOperation({ summary: 'Get a bucket by name' })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':name')
  async findOne(@Param('appid') appid: string, @Param('name') name: string) {
    const data = await this.bucketService.findOne(appid, name)
    if (!data) {
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
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Patch(':name')
  async update(
    @Param('appid') appid: string,
    @Param('name') name: string,
    @Body() dto: UpdateBucketDto,
  ) {
    const bucket = await this.bucketService.findOne(appid, name)
    if (!bucket) {
      throw new HttpException('bucket not found', HttpStatus.NOT_FOUND)
    }

    const res = await this.bucketService.update(bucket, dto)
    if (!res) {
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
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @ApiOperation({ summary: 'Delete a bucket' })
  @Delete(':name')
  async remove(@Param('appid') appid: string, @Param('name') name: string) {
    const bucket = await this.bucketService.findOne(appid, name)
    if (!bucket) {
      throw new HttpException('bucket not found', HttpStatus.NOT_FOUND)
    }

    if (bucket?.websiteHosting) {
      return ResponseUtil.error(
        'bucket has website hosting enabled, please delete it first',
      )
    }

    const res = await this.bucketService.delete(bucket)
    if (!res) {
      return ResponseUtil.error('delete bucket failed')
    }

    return ResponseUtil.ok(res)
  }

  async getSTSPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: `app-sts-full-grant`,
          Effect: 'Allow',
          Action: 's3:*',
          Resource: 'arn:aws:s3:::*',
        },
      ],
    }
    return JSON.stringify(policy)
  }
}
