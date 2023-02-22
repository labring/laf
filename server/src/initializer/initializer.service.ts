import { Injectable, Logger } from '@nestjs/common'
import { RegionService } from 'src/region/region.service'
import { MinioService } from 'src/storage/minio/minio.service'
import { CPU_UNIT, ServerConfig } from '../constants'
import { PrismaService } from '../prisma.service'
import * as assert from 'assert'

@Injectable()
export class InitializerService {
  private readonly logger = new Logger(InitializerService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
  ) {}

  async createDefaultRegion() {
    // check if exists
    const existed = await this.prisma.region.count()
    if (existed) {
      this.logger.debug('region already exists')
      return
    }

    // create default region
    const res = await this.prisma.region.create({
      data: {
        name: 'default',
        displayName: 'Default',
        tls: false,
        clusterConf: {
          driver: 'kubernetes',
        },
        databaseConf: {
          set: {
            driver: 'mongodb',
            connectionUri: ServerConfig.DATABASE_URL,
          },
        },
        storageConf: {
          set: {
            driver: 'minio',
            domain: ServerConfig.DEFAULT_REGION_MINIO_DOMAIN,
            externalEndpoint:
              ServerConfig.DEFAULT_REGION_MINIO_EXTERNAL_ENDPOINT,
            internalEndpoint:
              ServerConfig.DEFAULT_REGION_MINIO_INTERNAL_ENDPOINT,
            accessKey: ServerConfig.DEFAULT_REGION_MINIO_ROOT_ACCESS_KEY,
            secretKey: ServerConfig.DEFAULT_REGION_MINIO_ROOT_SECRET_KEY,
          },
        },
        gatewayConf: {
          set: {
            driver: 'apisix',
            runtimeDomain: ServerConfig.DEFAULT_REGION_RUNTIME_DOMAIN,
            websiteDomain: ServerConfig.DEFAULT_REGION_WEBSITE_DOMAIN,
            port: ServerConfig.DEFAULT_REGION_APISIX_PUBLIC_PORT,
            apiUrl: ServerConfig.DEFAULT_REGION_APISIX_API_URL,
            apiKey: ServerConfig.DEFAULT_REGION_APISIX_API_KEY,
          },
        },
      },
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
        resource: {
          limitCPU: 0.5 * CPU_UNIT,
          limitMemory: 256,
          requestCPU: 0.05 * CPU_UNIT,
          requestMemory: 128,
          databaseCapacity: 1024,
          storageCapacity: 1024 * 5,
          networkTrafficOutbound: 1024 * 5,
        },
        priority: 0,
        region: {
          connect: {
            name: 'default',
          },
        },
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

  async initMinioAlias() {
    const regions = await this.regionService.findAll()

    for (const region of regions) {
      const res = await this.minioService.setMinioClientTarget(region)
      if (res.status === 'success') {
        this.logger.verbose('MinioService init - ' + region.name + ' success')
      } else {
        this.logger.error('MinioService init - ' + region.name + ' failed', res)
        throw new Error('set minio client target failed ' + region.name)
      }
    }
  }
}
