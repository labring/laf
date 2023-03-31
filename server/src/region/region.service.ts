import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

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

  async findOne(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
    })

    return region
  }

  async findAll() {
    const regions = await this.prisma.region.findMany()
    return regions
  }

  async findOneDesensitized(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
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
        notes: true,
        bundles: {
          select: {
            id: true,
            name: true,
            displayName: true,
            priority: true,
            state: true,
            resource: true,
            limitCountPerUser: true,
            subscriptionOptions: true,
            notes: true,
          },
        },
      },
    })

    return regions
  }
}
