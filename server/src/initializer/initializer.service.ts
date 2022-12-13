import { Injectable, Logger } from '@nestjs/common'
import { CPU_UNIT, ServerConfig } from '../constants'
import { PrismaService } from '../prisma.service'

@Injectable()
export class InitializerService {
  private readonly logger = new Logger(InitializerService.name)
  constructor(private readonly prisma: PrismaService) {}

  async createDefaultRegion() {
    // check if exists
    const existed = await this.prisma.region.count()
    if (existed) {
      this.logger.debug('region already exists')
      return
    }

    // create default region
    const res = await this.prisma.region.create({
      data: { name: 'default' },
    })
    this.logger.verbose(`Created default region: ${res.name}`)
    return res
  }

  async createDefaultBundle() {
    // check if exists
    const existed = await this.prisma.bundle.count()
    if (existed) {
      this.logger.debug('default bundle already exists')
      return
    }

    // create default bundle
    const res = await this.prisma.bundle.create({
      data: {
        name: 'standard',
        displayName: 'Standard',
        limitCPU: 0.5 * CPU_UNIT,
        limitMemory: 256,
        requestCPU: 0.05 * CPU_UNIT,
        requestMemory: 128,
        databaseCapacity: 1024,
        storageCapacity: 1024 * 5,
        networkTrafficOutbound: 1024 * 5,
        priority: 0,
      },
    })
    this.logger.verbose('Created default bundle: ' + res.name)
    return res
  }

  async createDefaultRuntime() {
    // check if exists
    const existed = await this.prisma.runtime.count()
    if (existed) {
      this.logger.debug('default runtime already exists')
      return
    }

    // create default runtime
    const res = await this.prisma.runtime.create({
      data: {
        name: 'node',
        type: 'node:laf',
        image: {
          main: ServerConfig.DEFAULT_RUNTIME_IMAGE.image.main,
          init: ServerConfig.DEFAULT_RUNTIME_IMAGE.image.init,
        },
        version: ServerConfig.DEFAULT_RUNTIME_IMAGE.version,
        latest: true,
      },
    })
    this.logger.verbose('Created default runtime: ' + res.name)
    return res
  }
}
