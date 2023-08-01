import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseArray,
  ApiResponseObject,
  ApiResponsePagination,
  ResponseUtil,
} from 'src/utils/response'
import { BillingService } from './billing.service'
import { BillingQuery } from './interface/billing-query.interface'

import { ApplicationBilling } from './entities/application-billing'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { BillingsByDayDto } from './dto/billings.dto'
import { InjectUser } from 'src/utils/decorator'
import { User } from 'src/user/entities/user'

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
    isArray: true,
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
  @ApiQuery({
    name: 'state',
    type: String,
    description: 'billing state',
    required: false,
  })
  @Get()
  async findAll(
    @InjectUser() user: User,
    @Query('appid') appid?: string[],
    @Query('state') state?: string,
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

    if (state) {
      query.state = state
    }

    if (startTime) {
      query.startTime = new Date(startTime)
    }

    if (endTime) {
      query.endTime = new Date(endTime)
    }

    const billings = await this.billing.query(user._id, query)
    return ResponseUtil.ok(billings)
  }

  /**
   * Get my total expense
   */
  @ApiOperation({ summary: 'Get my total amount' })
  @ApiResponseObject(Number)
  @UseGuards(JwtAuthGuard)
  @Get('amount')
  async getExpense(
    @InjectUser() user: User,
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
    @Query('appid') appid?: string[],
    @Query('state') state?: string,
  ) {
    // default is 24 hours
    const query: BillingQuery = {
      startTime: startTime
        ? new Date(startTime)
        : new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
    }
    if (appid) {
      query.appid = appid
    }
    if (state) {
      query.state = state
    }

    const expenseTotal = await this.billing.getExpense(user._id, query)
    return ResponseUtil.ok(expenseTotal)
  }

  @ApiOperation({ summary: 'Get my total amount by day' })
  @ApiResponseArray(BillingsByDayDto)
  @UseGuards(JwtAuthGuard)
  @Get('amounts')
  async getExpenseByDay(
    @InjectUser() user: User,
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
    @Query('appid') appid?: string[],
    @Query('state') state?: string,
  ) {
    // default is 7 days
    const query: BillingQuery = {
      startTime: startTime
        ? new Date(startTime)
        : new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7),
      endTime: endTime ? new Date(endTime) : new Date(),
    }
    if (appid) {
      query.appid = appid
    }
    if (state) {
      query.state = state
    }

    const expenseTotal = await this.billing.getExpenseByDay(user._id, query)
    return ResponseUtil.ok(expenseTotal)
  }
}
