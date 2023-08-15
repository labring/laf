import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import {
  CalculatePriceDto,
  CalculatePriceResultDto,
} from './dto/calculate-price.dto'
import { ResourceService } from './resource.service'
import { RegionService } from 'src/region/region.service'
import { ObjectId } from 'mongodb'
import { BillingService } from './billing.service'
import { ResourceBundle, ResourceOption } from './entities/resource'

@ApiTags('Billing')
@Controller('resources')
export class ResourceController {
  constructor(
    private readonly resource: ResourceService,
    private readonly region: RegionService,
    private readonly billing: BillingService,
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

    // check if trial tier
    const isTrialTier = await this.resource.isTrialBundle(dto)
    if (isTrialTier) {
      result.total = 0
    }
    return ResponseUtil.ok(result)
  }

  /**
   * Get resource option list
   * TODO: deprecated, prepare to remove
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
