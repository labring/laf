import { Controller, Get, Logger, Param } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from '../utils/response'
import { RegionService } from './region.service'
import { ResourceService } from './resource.service'
import { ObjectId } from 'mongodb'

@ApiTags('Public')
@Controller('regions')
export class RegionController {
  private readonly logger = new Logger(RegionController.name)
  constructor(
    private readonly regionService: RegionService,
    private readonly resourceService: ResourceService,
  ) {}

  /**
   * Get region list
   * @returns
   */
  @ApiOperation({ summary: 'Get region list' })
  @Get()
  async getRegions() {
    const data = await this.regionService.findAllDesensitized()
    return ResponseUtil.ok(data)
  }

  /**
   * Get resource option list
   */
  @ApiOperation({ summary: 'Get resource option list' })
  @Get('resource-options')
  async getResourceOptions() {
    const data = await this.resourceService.findAll()
    return ResponseUtil.ok(data)
  }

  /**
   * Get resource option list by region id
   */
  @ApiOperation({ summary: 'Get resource option list by region id' })
  @Get('resource-options/:regionId')
  async getResourceOptionsByRegionId(@Param('regionId') regionId: string) {
    const data = await this.resourceService.findAllByRegionId(
      new ObjectId(regionId),
    )
    return ResponseUtil.ok(data)
  }

  /**
   * Get resource template list
   * @returns
   */
  @ApiOperation({ summary: 'Get resource template list' })
  @Get('resource-bundles')
  async getResourceBundles() {
    const data = await this.resourceService.findAllBundles()
    return ResponseUtil.ok(data)
  }
}
