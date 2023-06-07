import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseObject,
  ApiResponsePagination,
  ResponseUtil,
} from 'src/utils/response'
import { BillingQuery, BillingService } from './billing.service'

import { ApplicationBilling } from './entities/application-billing'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { ObjectId } from 'mongodb'
import { IRequest } from 'src/utils/interface'

@ApiTags('Billing')
@ApiBearerAuth('Authorization')
@Controller('billings')
export class BillingController {
  private readonly logger = new Logger(BillingController.name)

  constructor(private readonly billing: BillingService) {}

  /**
   * Get my billings
   */
  @ApiOperation({ summary: 'Get billings of an application' })
  @ApiResponsePagination(ApplicationBilling)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: 'appid',
    type: String,
    description: 'appid',
    required: false,
  })
  @ApiQuery({
    name: 'startTime',
    type: String,
    description: 'pagination start time',
    required: false,
    example: '2021-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endTime',
    type: String,
    description: 'pagination end time',
    required: false,
    example: '2022-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: 'page size',
    required: false,
    example: 10,
  })
  @Get()
  async findAll(
    @Req() req: IRequest,
    @Query('appid') appid?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const query: BillingQuery = {
      page: page || 1,
      pageSize: pageSize || 10,
    }

    if (query.pageSize > 100) {
      query.pageSize = 100
    }

    if (appid) {
      query.appid = appid
    }

    if (startTime) {
      query.startTime = new Date(startTime)
    }

    if (endTime) {
      query.endTime = new Date(endTime)
    }

    const user = req.user

    const billings = await this.billing.query(user._id, query)
    return ResponseUtil.ok(billings)
  }
}
