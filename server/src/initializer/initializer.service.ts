import { Injectable, Logger } from '@nestjs/common'
import { ServerConfig } from '../constants'
import { SystemDatabase } from 'src/system-database'
import { ApplicationNamespaceMode, Region } from 'src/region/entities/region'
import { Runtime } from 'src/application/entities/runtime'
import {
  ResourceOption,
  ResourceBundle,
  ResourceType,
} from 'src/billing/entities/resource'
import {
  AuthProvider,
  AuthProviderState,
} from 'src/authentication/entities/auth-provider'
import { Setting, SettingKey } from 'src/setting/entities/setting'
import * as path from 'path'
import { readFileSync, readdirSync } from 'node:fs'

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
    await this.createDefaultSettings()
    await this.createNecessarySettings()
  }

  async createDefaultRegion() {
    // check if exists
    const existed = await this.db.collection<Region>('Region').countDocuments()
    if (existed) {
      this.logger.debug('region already exists')
      return
    }

    // create default region
    let mode = ApplicationNamespaceMode.AppId
    if (ServerConfig.DEFAULT_REGION_NAMESPACE) {
      mode = ApplicationNamespaceMode.Fixed
    }

    const files = readdirSync(path.resolve(__dirname, './deploy-manifest'))
    const manifest = files.reduce((prev, file) => {
      const key = file.slice(0, -path.extname(file).length)
      const value = readFileSync(
        path.resolve(__dirname, './deploy-manifest', file),
        'utf8',
      )
      prev[key] = value
      return prev
    }, {})

    const res = await this.db.collection<Region>('Region').insertOne({
      name: 'default',
      displayName: 'Default',
      namespaceConf: {
        mode: mode,
        prefix: '',
        fixed: ServerConfig.DEFAULT_REGION_NAMESPACE,
      },
      clusterConf: {
        driver: 'kubernetes',
        kubeconfig: null,
        npmInstallFlags: '',
        runtimeAffinity: {},
      },
      bundleConf: {
        cpuRequestLimitRatio: 0.1,
        memoryRequestLimitRatio: 0.5,
      },
      databaseConf: {
        driver: 'mongodb',
        connectionUri: ServerConfig.DEFAULT_REGION_DATABASE_URL,
        controlConnectionUri: ServerConfig.DEFAULT_REGION_DATABASE_URL,
        dedicatedDatabase: {
          enabled: false,
        },
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
        driver: 'nginx',
        runtimeDomain: ServerConfig.DEFAULT_REGION_RUNTIME_DOMAIN,
        websiteDomain: ServerConfig.DEFAULT_REGION_WEBSITE_DOMAIN,
        port: 80,
        tls: {
          enabled: ServerConfig.DEFAULT_REGION_TLS_ENABLED,
          issuerRef: { name: 'laf-issuer', kind: 'Issuer' },
          wildcardCertificateSecretName:
            ServerConfig.DEFAULT_REGION_TLS_WILDCARD_CERTIFICATE_SECRET_NAME,
        },
      },
      logServerConf: {
        apiUrl: '',
        secret: '',
        databaseUrl: '',
      },
      prometheusConf: {
        apiUrl: ServerConfig.DEFAULT_REGION_PROMETHEUS_URL,
      },
      deployManifest: manifest,
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
        price: 0.0,
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
        price: 0.0,
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
        price: 0.0,
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
        price: 0.0,
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
      {
        regionId: region._id,
        type: ResourceType.DedicatedDatabaseCPU,
        price: 0.0,
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
        type: ResourceType.DedicatedDatabaseMemory,
        price: 0.0,
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
        type: ResourceType.DedicatedDatabaseCapacity,
        price: 0.0,
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
        type: ResourceType.DedicatedDatabaseReplicas,
        price: 0.0,
        specs: [
          { label: '1', value: 1 },
          { label: '3', value: 3 },
          { label: '5', value: 5 },
          { label: '7', value: 7 },
          { label: '9', value: 9 },
        ],
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
          [ResourceType.DedicatedDatabaseCPU]: { value: 200 },
          [ResourceType.DedicatedDatabaseMemory]: { value: 256 },
          [ResourceType.DedicatedDatabaseCapacity]: { value: 1024 },
          [ResourceType.DedicatedDatabaseReplicas]: { value: 1 },
        },
        enableFreeTier: false,
        limitCountOfFreeTierPerUser: 20,
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
          [ResourceType.DedicatedDatabaseCPU]: { value: 500 },
          [ResourceType.DedicatedDatabaseMemory]: { value: 512 },
          [ResourceType.DedicatedDatabaseCapacity]: { value: 4096 },
          [ResourceType.DedicatedDatabaseReplicas]: { value: 3 },
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
          [ResourceType.DedicatedDatabaseCPU]: { value: 1000 },
          [ResourceType.DedicatedDatabaseMemory]: { value: 2048 },
          [ResourceType.DedicatedDatabaseCapacity]: { value: 16384 },
          [ResourceType.DedicatedDatabaseReplicas]: { value: 5 },
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
          [ResourceType.DedicatedDatabaseCPU]: { value: 2000 },
          [ResourceType.DedicatedDatabaseMemory]: { value: 4096 },
          [ResourceType.DedicatedDatabaseCapacity]: { value: 65536 },
          [ResourceType.DedicatedDatabaseReplicas]: { value: 7 },
        },
        enableFreeTier: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    this.logger.verbose('Created default resource templates')
  }

  // create default settings
  async createDefaultSettings() {
    // check if exists
    const existed = await this.db
      .collection<Setting>('Setting')
      .countDocuments()

    if (existed) {
      this.logger.debug('default settings already exists')
      return
    }

    await this.db.collection<Setting>('Setting').insertOne({
      public: false,
      key: SettingKey.SignupBonus,
      value: '0',
      desc: 'Set up signup bonus',
    })

    await this.db.collection<Setting>('Setting').insertOne({
      public: true,
      key: SettingKey.InvitationProfit,
      value: '0',
      desc: 'Set up invitation rebate',
    })

    await this.db.collection<Setting>('Setting').insertOne({
      public: true,
      key: SettingKey.IdVerify,
      value: 'off', // on | off
      desc: 'real name authentication',
      metadata: {
        message: '',
        authenticateSite: '',
      },
    })

    await this.db.collection<Setting>('Setting').insertMany([
      {
        public: true,
        key: SettingKey.AiPilotUrl,
        value: 'https://htr4n1.laf.run/laf-gpt',
        desc: 'ai pilot url',
      },
      {
        public: true,
        key: SettingKey.LafForumUrl,
        value: 'https://forum.laf.run',
        desc: 'laf forum url',
      },
      {
        public: true,
        key: SettingKey.LafBusinessUrl,
        value: 'https://www.wenjuan.com/s/I36ZNbl',
        desc: 'laf business url',
      },
      {
        public: true,
        key: SettingKey.LafDiscordUrl,
        value:
          'https://discord.com/channels/1061659231599738901/1098516786170839050',
        desc: 'laf discord url',
      },
      {
        public: true,
        key: SettingKey.LafWeChatUrl,
        value: 'https://w4mci7-images.oss.laf.run/wechat.png',
        desc: 'laf wechat url',
      },
      {
        public: true,
        key: SettingKey.LafStatusUrl,
        value: 'https://hnpsxzqqtavv.cloud.sealos.cn/status/laf',
        desc: 'laf status url',
      },
      {
        public: true,
        key: SettingKey.LafAboutUsUrl,
        value: 'https://sealos.run/company/',
        desc: 'laf about us url',
      },
      {
        public: true,
        key: SettingKey.LafDocUrl,
        value: 'https://doc.laf.run/zh/',
        desc: 'laf doc site url',
      },
      {
        public: true,
        key: SettingKey.EnableWebPromoPage,
        value: 'true',
        desc: 'Whether to enable WebPromoPage',
      },
      {
        public: true,
        key: SettingKey.SealafNotification,
        value: 'off',
        desc: 'home page enable sealaf notification',
        metadata: {
          message: {
            zh: '',
            en: '',
          },
          gotoSite: '',
        },
      },
    ])

    this.logger.verbose('Created default settings')
  }

  async createNecessarySettings() {
    const find = await this.db
      .collection<Setting>('Setting')
      .findOne({ key: SettingKey.DefaultUserQuota })

    if (!find) {
      await this.db.collection<Setting>('Setting').insertOne({
        public: false,
        key: SettingKey.DefaultUserQuota,
        value: 'default',
        desc: 'resource limit of user',
        metadata: {
          limitOfCPU: 20000,
          limitOfMemory: 20480,
          limitCountOfApplication: 20,
          limitOfDatabaseSyncCount: {
            countLimit: 10,
            timePeriodInSeconds: 86400,
          },
        },
      })
    }
  }
}
