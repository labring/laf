import { Controller, Get, Logger } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResponseUtil, ResponseUtil } from 'src/common/response'
import { BundlesService } from './bundles.service'
import { BundleList } from './entities/bundle.entity'
import { RuntimeList } from './entities/runtime.entity'
import { RuntimesService } from './runtimes.service'

@ApiTags('Application')
@Controller()
export class SpecsController {
  private readonly logger = new Logger(SpecsController.name)
  constructor(
    private readonly bundleService: BundlesService,
    private readonly runtimeService: RuntimesService,
  ) {}

  /**
   * Get runtime list
   * @returns
   */
  @ApiResponseUtil(RuntimeList)
  @ApiOperation({ summary: 'Get application runtime list' })
  @Get('runtimes')
  async getRuntimes() {
    const data = await this.runtimeService.findAll()
    return ResponseUtil.ok(data)
  }

  /**
   * Get bundle list
   * @returns
   */
  @ApiResponseUtil(BundleList)
  @ApiOperation({ summary: 'Get application runtime list' })
  @Get('bundles')
  async getBundles() {
    const data = await this.bundleService.findAll()
    return ResponseUtil.ok(data)
  }
}
