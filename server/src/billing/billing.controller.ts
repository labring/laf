import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ResourceService } from './resource.service'
import { ApiResponseArray, ResponseUtil } from 'src/utils/response'
import { ObjectId } from 'mongodb'
import { BillingService } from './billing.service'
import { RegionService } from 'src/region/region.service'
import {
  CalculatePriceDto,
  CalculatePriceResultDto,
} from './dto/calculate-price.dto'
import { ResourceBundle, ResourceOption } from './entities/resource'
import { ApiResponseObject } from 'src/utils/response'

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name)

  constructor(
    private readonly resource: ResourceService,
    private readonly billing: BillingService,
    private readonly region: RegionService,
  ) {}

  /**
   * Calculate pricing
   * @param dto
   */
  @ApiOperation({ summary: 'Calculate pricing' })
  @Post('price')
  @ApiResponseObject(CalculatePriceResultDto)
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    // check regionId exists
    const region = await this.region.findOneDesensitized(
      new ObjectId(dto.regionId),
    )

    if (!region) {
      return ResponseUtil.error(`region ${dto.regionId} not found`)
    }

    const result = await this.billing.calculatePrice(dto)
    return ResponseUtil.ok(result)
  }

  /**
   * Get resource option list
   */
  @ApiOperation({ summary: 'Get resource option list' })
  @ApiResponseArray(ResourceOption)
  @Get('resource-options')
  async getResourceOptions() {
    const options = await this.resource.findAll()
    return ResponseUtil.ok(options)
  }

  /**
   * Get resource option list by region id
   */
  @ApiOperation({ summary: 'Get resource option list by region id' })
  @ApiResponseArray(ResourceOption)
  @Get('resource-options/:regionId')
  async getResourceOptionsByRegionId(@Param('regionId') regionId: string) {
    const data = await this.resource.findAllByRegionId(new ObjectId(regionId))
    return ResponseUtil.ok(data)
  }

  /**
   * Get resource template list
   * @returns
   */
  @ApiOperation({ summary: 'Get resource template list' })
  @ApiResponseArray(ResourceBundle)
  @Get('resource-bundles')
  async getResourceBundles() {
    const data = await this.resource.findAllBundles()
    return ResponseUtil.ok(data)
  }
}
