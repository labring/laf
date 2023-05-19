import { Injectable, Logger } from '@nestjs/common'
import { ServerConfig } from '../constants'
import { SystemDatabase } from 'src/database/system-database'
import { Region } from 'src/region/entities/region'
import { Runtime } from 'src/application/entities/runtime'
import {
  AuthProvider,
  AuthProviderState,
} from 'src/auth/entities/auth-provider'
import {
  ResourceOption,
  ResourceBundle,
  ResourceType,
} from 'src/region/entities/resource'

@Injectable()
export class InitializerService {
  private readonly logger = new Logger(InitializerService.name)
  private readonly db = SystemDatabase.db

  async init() {
    await this.createDefaultRegion()
    await this.createDefaultRuntime()
    await this.createDefaultAuthProvider()
    await this.createDefaultResourceOptions()
    await this.createDefaultResourceBundles()
  }

  async createDefaultRegion() {
    // check if exists
    const existed = await this.db.collection<Region>('Region').countDocuments()
    if (existed) {
      this.logger.debug('region already exists')
      return
    }

    // create default region
    const res = await this.db.collection<Region>('Region').insertOne({
      name: 'default',
      displayName: 'Default',
      tls: ServerConfig.DEFAULT_REGION_TLS,
      clusterConf: {
        driver: 'kubernetes',
        kubeconfig: null,
        npmInstallFlags: '',
      },
      databaseConf: {
        driver: 'mongodb',
        connectionUri: ServerConfig.DEFAULT_REGION_DATABASE_URL,
        controlConnectionUri: ServerConfig.DEFAULT_REGION_DATABASE_URL,
      },
      storageConf: {
        driver: 'minio',
        domain: ServerConfig.DEFAULT_REGION_MINIO_DOMAIN,
        externalEndpoint: ServerConfig.DEFAULT_REGION_MINIO_EXTERNAL_ENDPOINT,
        internalEndpoint: ServerConfig.DEFAULT_REGION_MINIO_INTERNAL_ENDPOINT,
        accessKey: ServerConfig.DEFAULT_REGION_MINIO_ROOT_ACCESS_KEY,
        secretKey: ServerConfig.DEFAULT_REGION_MINIO_ROOT_SECRET_KEY,
        controlEndpoint: ServerConfig.DEFAULT_REGION_MINIO_INTERNAL_ENDPOINT,
      },
      gatewayConf: {
        driver: 'apisix',
        runtimeDomain: ServerConfig.DEFAULT_REGION_RUNTIME_DOMAIN,
        websiteDomain: ServerConfig.DEFAULT_REGION_WEBSITE_DOMAIN,
        port: ServerConfig.DEFAULT_REGION_APISIX_PUBLIC_PORT,
        apiUrl: ServerConfig.DEFAULT_REGION_APISIX_API_URL,
        apiKey: ServerConfig.DEFAULT_REGION_APISIX_API_KEY,
      },
      updatedAt: new Date(),
      createdAt: new Date(),
      state: 'Active',
    })

    this.logger.verbose(`Created default region`)
    return res
  }

  async createDefaultRuntime() {
    // check if exists
    const existed = await this.db
      .collection<Runtime>('Runtime')
      .countDocuments()
    if (existed) {
      this.logger.debug('default runtime already exists')
      return
    }

    // create default runtime
    const res = await this.db.collection<Runtime>('Runtime').insertOne({
      name: 'node',
      type: 'node:laf',
      image: {
        main: ServerConfig.DEFAULT_RUNTIME_IMAGE.image.main,
        init: ServerConfig.DEFAULT_RUNTIME_IMAGE.image.init,
      },
      version: ServerConfig.DEFAULT_RUNTIME_IMAGE.version,
      latest: true,
      state: 'Active',
    })

    this.logger.verbose('Created default runtime')
    return res
  }

  async createDefaultAuthProvider() {
    // check if exists
    const existed = await this.db
      .collection<AuthProvider>('AuthProvider')
      .countDocuments()
    if (existed) {
      this.logger.debug('default auth provider already exists')
      return
    }

    // create default auth provider - user-password
    await this.db.collection<AuthProvider>('AuthProvider').insertOne({
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // create auth provider - phone code
    await this.db.collection<AuthProvider>('AuthProvider').insertOne({
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    this.logger.verbose('Created default auth providers')
  }

  async createDefaultResourceOptions() {
    // check if exists
    const existed = await this.db
      .collection<ResourceOption>('ResourceOption')
      .countDocuments()
    if (existed) {
      this.logger.debug('default resource options already exists')
      return
    }

    // get default region
    const region = await this.db.collection<Region>('Region').findOne({})

    // create default resource options
    await this.db.collection<ResourceOption>('ResourceOption').insertMany([
      {
        regionId: region._id,
        type: ResourceType.CPU,
        price: 0.072,
        specs: [
          { label: '0.2 Core', value: 200 },
          { label: '0.5 Core', value: 500 },
          { label: '1 Core', value: 1000 },
          { label: '2 Core', value: 2000 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        regionId: region._id,
        type: ResourceType.Memory,
        price: 0.036,
        specs: [
          { label: '256 MB', value: 256 },
          { label: '512 MB', value: 512 },
          { label: '1 GB', value: 1024 },
          { label: '2 GB', value: 2048 },
          { label: '4 GB', value: 4096 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        regionId: region._id,
        type: ResourceType.DatabaseCapacity,
        price: 0.0072,
        specs: [
          { label: '1 GB', value: 1024 },
          { label: '4 GB', value: 4096 },
          { label: '16 GB', value: 16384 },
          { label: '64 GB', value: 65536 },
          { label: '256 GB', value: 262144 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        regionId: region._id,
        type: ResourceType.StorageCapacity,
        price: 0.002,
        specs: [
          { label: '1 GB', value: 1024 },
          { label: '4 GB', value: 4096 },
          { label: '16 GB', value: 16384 },
          { label: '64 GB', value: 65536 },
          { label: '256 GB', value: 262144 },
          { label: '1 TB', value: 1048576 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        regionId: region._id,
        type: ResourceType.NetworkTraffic,
        price: 0.8,
        specs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    this.logger.verbose('Created default resource options')
  }

  async createDefaultResourceBundles() {
    // check if exists
    const existed = await this.db
      .collection<ResourceBundle>('ResourceBundle')
      .countDocuments()

    if (existed) {
      this.logger.debug('default resource templates already exists')
      return
    }

    // get default region
    const region = await this.db.collection<Region>('Region').findOne({})

    // create default resource templates
    await this.db.collection<ResourceBundle>('ResourceBundle').insertMany([
      {
        regionId: region._id,
        name: 'trial',
        displayName: 'Trial',
        spec: {
          [ResourceType.CPU]: { value: 200 },
          [ResourceType.Memory]: { value: 256 },
          [ResourceType.DatabaseCapacity]: { value: 1024 },
          [ResourceType.StorageCapacity]: { value: 1024 },
          [ResourceType.NetworkTraffic]: { value: 0 },
        },
        enableFreeTier: true,
        limitCountOfFreeTierPerUser: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        regionId: region._id,
        name: 'lite',
        displayName: 'Lite',
        spec: {
          [ResourceType.CPU]: { value: 500 },
          [ResourceType.Memory]: { value: 512 },
          [ResourceType.DatabaseCapacity]: { value: 4096 },
          [ResourceType.StorageCapacity]: { value: 4096 },
          [ResourceType.NetworkTraffic]: { value: 0 },
        },
        enableFreeTier: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        regionId: region._id,
        name: 'standard',
        displayName: 'Standard',
        spec: {
          [ResourceType.CPU]: { value: 1000 },
          [ResourceType.Memory]: { value: 2048 },
          [ResourceType.DatabaseCapacity]: { value: 16384 },
          [ResourceType.StorageCapacity]: { value: 65536 },
          [ResourceType.NetworkTraffic]: { value: 0 },
        },
        enableFreeTier: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        regionId: region._id,
        name: 'pro',
        displayName: 'Pro',
        spec: {
          [ResourceType.CPU]: { value: 2000 },
          [ResourceType.Memory]: { value: 4096 },
          [ResourceType.DatabaseCapacity]: { value: 65536 },
          [ResourceType.StorageCapacity]: { value: 262144 },
          [ResourceType.NetworkTraffic]: { value: 0 },
        },
        enableFreeTier: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    this.logger.verbose('Created default resource templates')
  }
}
