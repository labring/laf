import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class RegionService {
  constructor(private readonly prisma: PrismaService) {}

  async findByAppId(appid: string) {
    const app = await this.prisma.application.findUnique({
      where: { appid },
      select: {
        region: true,
      },
    })

    return app.region
  }

  async findOne(name: string) {
    const region = await this.prisma.region.findUnique({
      where: { name },
    })

    return region
  }

  async findAll() {
    const regions = await this.prisma.region.findMany()
    return regions
  }

  async findOneDesensitized(name: string) {
    const region = await this.prisma.region.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        displayName: true,
        state: true,
        storageConf: false,
        gatewayConf: false,
        databaseConf: false,
        clusterConf: false,
        createdAt: false,
        updatedAt: false,
      },
    })

    return region
  }

  async findAllDesensitized() {
    const regions = await this.prisma.region.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        state: true,
        storageConf: false,
        gatewayConf: false,
        databaseConf: false,
        clusterConf: false,
        bundles: {
          select: {
            id: true,
            name: true,
            displayName: true,
            limitCPU: true,
            limitMemory: true,
            regionName: false,
            requestCPU: false,
            requestMemory: true,
            databaseCapacity: true,
            storageCapacity: true,
            price: true,
            priority: true,
            state: true,
          },
        },
      },
    })

    return regions
  }
}
