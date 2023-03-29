import { Injectable, Logger } from '@nestjs/common'
import { AuthProviderState } from '@prisma/client'
import { RegionService } from 'src/region/region.service'
import { MinioService } from 'src/storage/minio/minio.service'
import { CPU_UNIT, ServerConfig } from '../constants'
import { PrismaService } from '../prisma/prisma.service'

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
        tls: ServerConfig.DEFAULT_REGION_TLS,
        clusterConf: {
          driver: 'kubernetes',
        },
        databaseConf: {
          set: {
            driver: 'mongodb',
            connectionUri: ServerConfig.DEFAULT_REGION_DATABASE_URL,
            controlConnectionUri: ServerConfig.DEFAULT_REGION_DATABASE_URL,
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
            controlEndpoint:
              ServerConfig.DEFAULT_REGION_MINIO_INTERNAL_ENDPOINT,
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
        limitCountPerUser: 10,
        priority: 0,
        maxRenewalTime: 3600 * 24 * 365 * 10,
        resource: {
          limitCPU: 1 * CPU_UNIT,
          limitMemory: 512,
          requestCPU: 0.05 * CPU_UNIT,
          requestMemory: 128,

          databaseCapacity: 1024,
          storageCapacity: 1024 * 5,
          networkTrafficOutbound: 1024 * 5,

          limitCountOfCloudFunction: 500,
          limitCountOfBucket: 10,
          limitCountOfDatabasePolicy: 10,
          limitCountOfTrigger: 10,
          limitCountOfWebsiteHosting: 10,
          reservedTimeAfterExpired: 3600 * 24 * 7,

          limitDatabaseTPS: 100,
          limitStorageTPS: 1000,
        },
        subscriptionOptions: [
          {
            name: 'monthly',
            displayName: '1 Month',
            duration: 31 * 24 * 3600,
            price: 0,
            specialPrice: 0,
          },
          {
            name: 'half-yearly',
            displayName: '6 Months',
            duration: 6 * 31 * 24 * 3600,
            price: 0,
            specialPrice: 0,
          },
          {
            name: 'yearly',
            displayName: '12 Months',
            duration: 12 * 31 * 24 * 3600,
            price: 0,
            specialPrice: 0,
          },
        ],
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

  async createDefaultAuthProvider() {
    // check if exists
    const existed = await this.prisma.authProvider.count()
    if (existed) {
      this.logger.debug('default auth provider already exists')
      return
    }

    // create default auth provider - user-password
    const resPassword = await this.prisma.authProvider.create({
      data: {
        name: 'user-password',
        bind: {
          password: 'optional',
          phone: 'optional',
          email: 'optional',
        },
        register: true,
        default: true,
        state: AuthProviderState.Enabled,
        config: { usernameField: 'username', passwordField: 'password' },
      },
    })

    // create auth provider - phone code
    const resPhone = await this.prisma.authProvider.create({
      data: {
        name: 'phone',
        bind: {
          password: 'optional',
          phone: 'optional',
          email: 'optional',
        },
        register: true,
        default: false,
        state: AuthProviderState.Disabled,
        config: {
          alisms: {},
        },
      },
    })

    this.logger.verbose(
      'Created default auth providers: ' +
        resPassword.name +
        '  ' +
        resPhone.name,
    )
    return resPhone
  }
}
