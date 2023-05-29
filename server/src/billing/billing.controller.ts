import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseObject,
  ApiResponsePagination,
  ResponseUtil,
} from 'src/utils/response'
import { BillingService } from './billing.service'

import { ApplicationBilling } from './entities/application-billing'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'
import { ObjectId } from 'mongodb'

@ApiTags('Billing')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/billings')
export class BillingController {
  private readonly logger = new Logger(BillingController.name)

  constructor(private readonly billing: BillingService) {}

  /**
   * Get all billing of application
   */
  @ApiOperation({ summary: 'Get billings of an application' })
  @ApiResponsePagination(ApplicationBilling)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @ApiQuery({
    name: 'startTime',
    type: String,
    description: 'pagination start time',
    required: true,
  })
  @ApiQuery({
    name: 'endTime',
    type: String,
    description: 'pagination end time',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'page number',
    required: true,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: 'page size',
    required: true,
  })
  @Get()
  async findAllByAppId(
    @Param('appid') appid: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    const billings = await this.billing.findAllByAppId(
      appid,
      new Date(startTime),
      new Date(endTime),
      page,
      pageSize,
    )
    return ResponseUtil.ok(billings)
  }

  /**
   * Get billing by id
   */
  @ApiOperation({ summary: 'Get billing by id' })
  @ApiResponseObject(ApplicationBilling)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get(':id')
  async findOne(@Param('appid') appid: string, @Param('id') id: string) {
    const billing = await this.billing.findOne(appid, new ObjectId(id))
    return ResponseUtil.ok(billing)
  }
}
