import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseArray,
  ApiResponseObject,
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
  @ApiResponseArray(ApplicationBilling)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async findAllByAppId(@Param('appid') appid: string) {
    const billings = await this.billing.findAllByAppId(appid)
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
