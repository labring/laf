import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateApplicationDto } from 'src/application/dto/create-application.dto'
import { ResourceService } from './resource.service'
import { ResponseUtil } from 'src/utils/response'
import { ObjectId } from 'mongodb'
import { BillingService } from './billing.service'
import { RegionService } from 'src/region/region.service'

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
  async calculatePrice(@Body() dto: CreateApplicationDto) {
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
  @Get('resource-options')
  async getResourceOptions() {
    const options = await this.resource.findAll()
    const grouped = this.resource.groupByType(options)
    return ResponseUtil.ok(grouped)
  }

  /**
   * Get resource option list by region id
   */
  @ApiOperation({ summary: 'Get resource option list by region id' })
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
  @Get('resource-bundles')
  async getResourceBundles() {
    const data = await this.resource.findAllBundles()
    return ResponseUtil.ok(data)
  }
}
