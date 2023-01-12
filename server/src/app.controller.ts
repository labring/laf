import { Controller, Get, Logger } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResponseUtil } from './utils/response'
import { PrismaService } from './prisma.service'

@ApiTags('Public')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get region list
   * @returns
   */
  @ApiOperation({ summary: 'Get region list' })
  @Get('regions')
  async getRegions() {
    const data = await this.prisma.region.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        state: true,
        bundles: {
          select: {
            id: true,
            name: true,
            displayName: true,
            regionName: true,
            requestCPU: true,
            requestMemory: true,
            databaseCapacity: true,
            storageCapacity: true,
            price: true,
            priority: true,
            state: true,
            limitCPU: false,
            limitMemory: false,
          },
        },
      },
    })
    return ResponseUtil.ok(data)
  }

  /**
   * Get runtime list
   * @returns
   */
  @ApiOperation({ summary: 'Get application runtime list' })
  @Get('runtimes')
  async getRuntimes() {
    const data = await this.prisma.runtime.findMany({})
    return ResponseUtil.ok(data)
  }

  // /**
  //  * Get bundle list
  //  * @returns
  //  */
  // @ApiOperation({ summary: 'Get application runtime list' })
  // @Get('bundles')
  // async getBundles() {
  //   const data = await this.prisma.bundle.findMany({
  //     select: {
  //       limitCPU: false,
  //       limitMemory: false,
  //     },
  //   })
  //   return ResponseUtil.ok(data)
  // }
}
