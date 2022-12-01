import { Controller, Get, Logger } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResponseUtil, ResponseUtil } from '../common/response'
import { BundleCoreService } from '../core/bundle.cr.service'
import { BundleList } from '../core/api/bundle.cr'
import { RuntimeList } from '../core/api/runtime.cr'
import { RuntimeCoreService } from '../core/runtime.cr.service'

@ApiTags('Application')
@Controller()
export class SpecsController {
  private readonly logger = new Logger(SpecsController.name)
  constructor(
    private readonly bundleService: BundleCoreService,
    private readonly runtimeService: RuntimeCoreService,
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
