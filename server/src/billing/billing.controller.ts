import { Controller, Get, Logger, Query, Req, UseGuards } from '@nestjs/common'
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
import { IRequest } from 'src/utils/interface'
import { BillingsByDayDto } from './dto/billings.dto'
import { TeamAuthGuard } from 'src/team/team-auth.guard'
import { TeamRoles } from 'src/team/team-role.decorator'
import { TeamRole } from 'src/team/entities/team-member'
import { InjectTeam } from 'src/utils/decorator'
import { Team } from 'src/team/entities/team'

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
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @ApiQuery({
    name: 'appid',
    type: String,
    description: 'appid',
    required: false,
    isArray: true,
  })
  @ApiQuery({
    name: 'teamId',
    type: String,
    description: 'teamId',
    required: true,
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
    @Req() req: IRequest,
    @InjectTeam() team: Team,
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

    const billings = await this.billing.query(team, query)
    return ResponseUtil.ok(billings)
  }

  /**
   * Get my total expense
   */
  @ApiOperation({ summary: 'Get my total amount' })
  @ApiResponseObject(Number)
  @ApiQuery({
    name: 'teamId',
    type: String,
    description: 'teamId',
    required: true,
  })
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Get('amount')
  async getExpense(
    @InjectTeam() team: Team,
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

    const expenseTotal = await this.billing.getExpense(team, query)
    return ResponseUtil.ok(expenseTotal)
  }

  @ApiOperation({ summary: 'Get my total amount by day' })
  @ApiResponseArray(BillingsByDayDto)
  @ApiQuery({
    name: 'teamId',
    type: String,
    description: 'teamId',
    required: true,
  })
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Get('amounts')
  async getExpenseByDay(
    @InjectTeam() team: Team,
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

    const expenseTotal = await this.billing.getExpenseByDay(team, query)
    return ResponseUtil.ok(expenseTotal)
  }
}
