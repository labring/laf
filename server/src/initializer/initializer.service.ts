import { Injectable, Logger } from '@nestjs/common'
import { CPU_UNIT, MB } from 'src/constants'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class InitializerService {
  private readonly logger = new Logger(InitializerService.name)
  constructor(private readonly prisma: PrismaService) {}

  async createDefaultRegion() {
    // check if exists
    const region = await this.prisma.region.findUnique({
      where: { name: 'default' },
    })
    if (region) {
      this.logger.debug('default region already exists')
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
    const bundle = await this.prisma.bundle.findUnique({
      where: { name: 'mini' },
    })
    if (bundle) {
      this.logger.debug('default bundle already exists')
      return
    }

    // create default bundle
    const res = await this.prisma.bundle.create({
      data: {
        name: 'mini',
        displayName: 'Mini',
        limitCPU: 0.5 * CPU_UNIT,
        limitMemory: 128,
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
    const runtime = await this.prisma.runtime.findUnique({
      where: { name: 'node-laf' },
    })
    if (runtime) {
      this.logger.debug('default runtime already exists')
      return
    }

    // create default runtime
    const res = await this.prisma.runtime.create({
      data: {
        name: 'node-laf',
        type: 'node:laf',
        image: {
          main: 'docker.io/lafyun/runtime-node:1.0.0-alpha.0',
        },
        version: '1.0-alpha.0',
        latest: true,
      },
    })
    this.logger.verbose('Created default runtime: ' + res.name)
    return res
  }
}
