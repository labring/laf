import { Controller, Get, Logger } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PrismaService } from 'src/prisma.service'
import { ResponseUtil } from '../common/response'

@ApiTags('Application')
@Controller()
export class SpecsController {
  private readonly logger = new Logger(SpecsController.name)
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get region list
   * @returns
   */
  @ApiOperation({ summary: 'Get region list' })
  @Get('regions')
  async getRegions() {
    const data = await this.prisma.region.findMany()
    return ResponseUtil.ok(data)
  }

  /**
   * Get runtime list
   * @returns
   */
  @ApiOperation({ summary: 'Get application runtime list' })
  @Get('runtimes')
  async getRuntimes() {
    const data = await this.prisma.runtime.findMany()
    return ResponseUtil.ok(data)
  }

  /**
   * Get bundle list
   * @returns
   */
  @ApiOperation({ summary: 'Get application runtime list' })
  @Get('bundles')
  async getBundles() {
    const data = await this.prisma.bundle.findMany()
    return ResponseUtil.ok(data)
  }
}
