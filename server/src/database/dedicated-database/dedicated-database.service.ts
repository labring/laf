import { Injectable, Logger } from '@nestjs/common'
import { Region } from 'src/region/entities/region'
import {
  DedicatedDatabase,
  DedicatedDatabasePhase,
  DedicatedDatabaseSpec,
  DedicatedDatabaseState,
} from '../entities/dedicated-database'
import { RegionService } from 'src/region/region.service'
import { ClusterService } from 'src/region/cluster/cluster.service'
import * as _ from 'lodash'
import { SystemDatabase } from 'src/system-database'
import { KubernetesObject, loadAllYaml } from '@kubernetes/client-node'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { ClientSession } from 'mongodb'
import * as mongodb_uri from 'mongodb-uri'
import { MongoService } from 'src/database/mongo.service'
import { MongoAccessor } from 'database-proxy'
import { ApplicationBundle } from 'src/application/entities/application-bundle'
import * as assert from 'assert'
import { extractNumber } from 'src/utils/number'
import { formatK8sErrorAsJson } from 'src/utils/k8s-error'
import { ServerConfig, KUBEBLOCK_V5_UPGRADE_API_TIMEOUT } from 'src/constants'

const getDedicatedDatabaseName = (appid: string) => appid

@Injectable()
export class DedicatedDatabaseService {
  private readonly logger = new Logger(DedicatedDatabase.name)
  constructor(
    private readonly cluster: ClusterService,
    private readonly regionService: RegionService,
    private readonly mongoService: MongoService,
  ) {}

  async create(appid: string, session?: ClientSession) {
    const db = SystemDatabase.db

    await db.collection<DedicatedDatabase>('DedicatedDatabase').insertOne(
      {
        appid,
        name: appid,
        createdAt: new Date(),
        updatedAt: new Date(),
        lockedAt: TASK_LOCK_INIT_TIME,
        phase: DedicatedDatabasePhase.Starting,
        state: DedicatedDatabaseState.Running,
      },
      { session },
    )
  }

  async applyDeployManifest(
    region: Region,
    appid: string,
    patch?: Partial<DedicatedDatabaseSpec>,
  ) {
    const spec = await this.getDedicatedDatabaseSpec(appid)
    const manifest = this.makeDeployManifest(region, appid, {
      ...spec,
      ...patch,
    })
    const res = await this.cluster.applyYamlString(region, manifest)
    return res
  }

  async updateDeployManifest(region: Region, appid: string) {
    const spec = await this.getDedicatedDatabaseSpec(appid)

    const manifest = await this.getDeployManifest(region, appid)
    if (!manifest) {
      this.logger.warn(`Deploy manifest not found for ${appid}, skip update`)
      return null
    }

    const componentSpec = manifest.spec.componentSpecs[0]

    // Extract current values from manifest
    const currentReplicas = Number(componentSpec.replicas)
    const currentLimitCPU = extractNumber(componentSpec.resources?.limits?.cpu)
    const currentLimitMemory = extractNumber(
      componentSpec.resources?.limits?.memory,
    )
    const currentCapacity = extractNumber(
      componentSpec.volumeClaimTemplates?.[0]?.spec?.resources?.requests
        ?.storage,
    )

    // Detect what has changed (using same comparison logic as isDeployManifestChanged)
    const isLimitCpuMatch =
      spec.limitCPU === currentLimitCPU ||
      spec.limitCPU / 1000 === currentLimitCPU
    const isLimitMemoryMatch =
      spec.limitMemory === currentLimitMemory ||
      spec.limitMemory / 1024 === currentLimitMemory
    const isCapacityMatch =
      spec.capacity === currentCapacity ||
      spec.capacity / 1024 === currentCapacity
    const isReplicasMatch = spec.replicas === currentReplicas

    const cpuOrMemoryChanged = !isLimitCpuMatch || !isLimitMemoryMatch
    const replicasChanged = !isReplicasMatch
    const capacityChanged = !isCapacityMatch

    const results: any[] = []

    // Apply verticalScaling if CPU or memory changed
    if (cpuOrMemoryChanged) {
      try {
        const OpsRequestManifest =
          await this.getKubeBlockOpsRequestManifestForSpec(
            region,
            appid,
            'verticalScaling',
          )
        if (!OpsRequestManifest) {
          const result = await this.applyKubeBlockOpsRequestManifestForSpec(
            region,
            appid,
            spec,
            'verticalScaling',
          )
          results.push(result)
          this.logger.log(
            `Applied verticalScaling ops request for ${appid}: limitCPU=${spec.limitCPU}m, limitMemory=${spec.limitMemory}Mi`,
          )
        }
      } catch (error) {
        this.logger.error(
          `Failed to apply verticalScaling ops request for ${appid}:\n${formatK8sErrorAsJson(
            error,
          )}`,
        )
      }
    }

    // Apply horizontalScaling if replicas changed
    if (replicasChanged) {
      try {
        const OpsRequestManifest =
          await this.getKubeBlockOpsRequestManifestForSpec(
            region,
            appid,
            'horizontalScaling',
          )

        if (!OpsRequestManifest) {
          const result = await this.applyKubeBlockOpsRequestManifestForSpec(
            region,
            appid,
            spec,
            'horizontalScaling',
          )

          // Call KubeBlock v5 compatibility API if needed
          await this.handleKubeBlockV5Upgrade(appid, manifest, spec.replicas)

          results.push(result)
          this.logger.log(
            `Applied horizontalScaling ops request for ${appid}: replicas=${spec.replicas}`,
          )
        }
      } catch (error) {
        this.logger.error(
          `Failed to apply horizontalScaling ops request for ${appid}:\n${formatK8sErrorAsJson(
            error,
          )}`,
        )
      }
    }

    // Apply volumeExpansion if capacity changed
    if (capacityChanged) {
      try {
        const OpsRequestManifest =
          await this.getKubeBlockOpsRequestManifestForSpec(
            region,
            appid,
            'volumeExpansion',
          )
        if (!OpsRequestManifest) {
          const result = await this.applyKubeBlockOpsRequestManifestForSpec(
            region,
            appid,
            spec,
            'volumeExpansion',
          )
          results.push(result)
          this.logger.log(
            `Applied volumeExpansion ops request for ${appid}: capacity=${
              spec.capacity / 1024
            }Gi`,
          )
        }
      } catch (error) {
        this.logger.error(
          `Failed to apply volumeExpansion ops request for ${appid}:\n${formatK8sErrorAsJson(
            error,
          )}`,
        )
      }
    }

    // If nothing changed, return null
    if (!cpuOrMemoryChanged && !replicasChanged && !capacityChanged) {
      this.logger.debug(`No changes detected for ${appid}, skip update`)
      return null
    }

    return results.length === 1 ? results[0] : results
  }

  async getDedicatedDatabaseSpec(
    appid: string,
  ): Promise<DedicatedDatabaseSpec> {
    const db = SystemDatabase.db

    const bundle = await db
      .collection<ApplicationBundle>('ApplicationBundle')
      .findOne({ appid })

    return bundle.resource.dedicatedDatabase
  }

  async findOne(appid: string) {
    const db = SystemDatabase.db

    const res = await db
      .collection<DedicatedDatabase>('DedicatedDatabase')
      .findOne({
        appid,
      })

    return res
  }

  async deleteDeployManifest(region: Region, appid: string) {
    const manifest = await this.getDeployManifest(region, appid)
    if (!manifest) {
      return
    }
    const res = await this.cluster.deleteCustomObject(region, manifest)
    return res
  }

  async getDeployManifest(region: Region, appid: string) {
    const api = this.cluster.makeObjectApi(region)
    const emptyManifest = this.makeDeployManifest(region, appid)
    const specs = loadAllYaml(emptyManifest)
    assert(
      specs && specs.length > 0,
      'the deploy manifest of database should not be empty',
    )
    const spec = specs[0]

    try {
      const manifest = await api.read(spec)
      return manifest.body as KubernetesObject & { spec: any; status: any }
    } catch (err) {
      return null
    }
  }

  makeDeployManifest(
    region: Region,
    appid: string,
    dto?: DedicatedDatabaseSpec,
  ) {
    dto = dto || {
      limitCPU: 0,
      limitMemory: 0,
      requestCPU: 0,
      requestMemory: 0,
      replicas: 0,
      capacity: 0,
    }
    const { limitCPU, limitMemory, replicas, capacity } = dto
    const name = getDedicatedDatabaseName(appid)

    const requestCPU =
      limitCPU * (region.bundleConf?.cpuRequestLimitRatio || 0.1)
    const requestMemory =
      limitMemory * (region.bundleConf?.memoryRequestLimitRatio || 0.5)

    const template = region.deployManifest.database
    const tmpl = _.template(template)
    // Capacity: Convert to Gi format, e.g., "10Gi"
    const manifest = tmpl({
      name,
      limitCPU,
      limitMemory,
      requestCPU,
      requestMemory,
      capacity: capacity / 1024,
      replicas,
    })

    return manifest
  }

  async isDeployManifestChanged(
    region: Region,
    appid: string,
  ): Promise<boolean> {
    const ddbDeployManifest = await this.getDeployManifest(region, appid)

    if (!ddbDeployManifest) {
      this.logger.debug(`restart ddb,  deploy manifest not found for ${appid}`)
      return true
    }

    const replicas = Number(ddbDeployManifest.spec.componentSpecs[0].replicas)

    const limitCPU = extractNumber(
      ddbDeployManifest.spec.componentSpecs[0].resources?.limits?.cpu,
    )
    const limitMemory = extractNumber(
      ddbDeployManifest.spec.componentSpecs[0].resources?.limits?.memory,
    )
    const capacity = extractNumber(
      ddbDeployManifest.spec.componentSpecs[0]?.volumeClaimTemplates[0]?.spec
        ?.resources?.requests?.storage,
    )

    const spec = await this.getDedicatedDatabaseSpec(appid)

    const isLimitCpuMatch =
      spec.limitCPU === limitCPU || spec.limitCPU / 1000 === limitCPU
    const isLimitMemoryMatch =
      spec.limitMemory === limitMemory ||
      spec.limitMemory / 1024 === limitMemory
    const isCapacityMatch =
      spec.capacity === capacity || spec.capacity / 1024 === capacity
    const isReplicasMatch = spec.replicas === replicas

    return !(
      isLimitCpuMatch &&
      isLimitMemoryMatch &&
      isReplicasMatch &&
      isCapacityMatch
    )
  }

  async applyKubeBlockOpsRequestManifest(
    region: Region,
    appid: string,
    type: 'restart' | 'stop' | 'start' = 'restart',
  ) {
    const manifest = this.makeKubeBlockOpsRequestManifest(region, appid, type)
    const res = await this.cluster.applyYamlString(region, manifest)
    return res
  }

  async applyKubeBlockOpsRequestManifestForSpec(
    region: Region,
    appid: string,
    spec: DedicatedDatabaseSpec,
    type: 'verticalScaling' | 'horizontalScaling' | 'volumeExpansion',
  ) {
    const manifest = this.makeKubeBlockOpsRequestManifestForSpec(
      region,
      appid,
      spec,
      type,
    )
    const res = await this.cluster.applyYamlString(region, manifest)
    return res
  }

  async deleteKubeBlockOpsManifest(
    region: Region,
    appid: string,
    type: 'restart' | 'stop' | 'start' = 'restart',
  ) {
    const manifest = await this.getKubeBlockOpsRequestManifest(
      region,
      appid,
      type,
    )
    if (!manifest) {
      return
    }
    const res = await this.cluster.deleteCustomObject(region, manifest)
    return res
  }

  async deleteKubeBlockOpsManifestForSpec(
    region: Region,
    appid: string,
    type: 'verticalScaling' | 'horizontalScaling' | 'volumeExpansion',
  ) {
    const manifest = await this.getKubeBlockOpsRequestManifestForSpec(
      region,
      appid,
      type,
    )
    if (!manifest) {
      return
    }
    const res = await this.cluster.deleteCustomObject(region, manifest)
    return res
  }

  async getKubeBlockOpsRequestManifest(
    region: Region,
    appid: string,
    type: 'restart' | 'stop' | 'start' = 'restart',
  ) {
    const api = this.cluster.makeObjectApi(region)
    const emptyManifest = this.makeKubeBlockOpsRequestManifest(
      region,
      appid,
      type,
    )
    const specs = loadAllYaml(emptyManifest)
    assert(
      specs && specs.length > 0,
      'the OpsRequest manifest of database should not be empty',
    )
    const spec = specs[0]
    try {
      const manifest = await api.read(spec)
      return manifest.body as KubernetesObject & { spec: any; status: any }
    } catch (err) {
      return null
    }
  }

  async getKubeBlockOpsRequestManifestForSpec(
    region: Region,
    appid: string,
    type: 'verticalScaling' | 'horizontalScaling' | 'volumeExpansion',
  ) {
    const spec = await this.getDedicatedDatabaseSpec(appid)
    const api = this.cluster.makeObjectApi(region)
    const emptyManifest = this.makeKubeBlockOpsRequestManifestForSpec(
      region,
      appid,
      spec,
      type,
    )
    const specs = loadAllYaml(emptyManifest)
    assert(
      specs && specs.length > 0,
      'the OpsRequest manifest of database should not be empty',
    )
    const specObj = specs[0]
    try {
      const manifest = await api.read(specObj)
      return manifest.body as KubernetesObject & { spec: any; status: any }
    } catch (err) {
      return null
    }
  }

  makeKubeBlockOpsRequestManifest(
    region: Region,
    appid: string,
    type: 'restart' | 'stop' | 'start' = 'restart',
  ) {
    const clusterName = getDedicatedDatabaseName(appid)

    let template: string
    let name: string
    switch (type) {
      case 'restart':
        template = region.deployManifest.databaseOpsRequestRestart
        name = `${clusterName}-restart`
        break
      case 'stop':
        template = region.deployManifest.databaseOpsRequestStop
        name = `${clusterName}-stop`
        break
      case 'start':
        template = region.deployManifest.databaseOpsRequestStart
        name = `${clusterName}-start`
        break
      default:
        // This should never happen due to TypeScript type checking,
        // but provides runtime safety
        throw new Error(`Unknown ops request type: ${type}`)
    }

    const tmpl = _.template(template)

    const manifest = tmpl({
      name,
      clusterName,
    })

    return manifest
  }

  makeKubeBlockOpsRequestManifestForSpec(
    region: Region,
    appid: string,
    spec: DedicatedDatabaseSpec,
    type: 'verticalScaling' | 'horizontalScaling' | 'volumeExpansion',
  ) {
    const clusterName = getDedicatedDatabaseName(appid)

    let template: string
    let name: string
    switch (type) {
      case 'verticalScaling':
        template = region.deployManifest.databaseOpsRequestVerticalScaling
        name = `${clusterName}-vertical-scaling`
        break
      case 'horizontalScaling':
        template = region.deployManifest.databaseOpsRequestHorizontalScaling
        name = `${clusterName}-horizontal-scaling`
        break
      case 'volumeExpansion':
        template = region.deployManifest.databaseOpsRequestVolumeExpansion
        name = `${clusterName}-volume-expansion`
        break
      default:
        // This should never happen due to TypeScript type checking,
        // but provides runtime safety
        throw new Error(`Unknown ops request type: ${type}`)
    }

    const { limitCPU, limitMemory, replicas, capacity } = spec

    const requestCPU =
      limitCPU * (region.bundleConf?.cpuRequestLimitRatio || 0.1)
    const requestMemory =
      limitMemory * (region.bundleConf?.memoryRequestLimitRatio || 0.5)

    const tmpl = _.template(template)

    const manifest = tmpl({
      name,
      clusterName,
      limitCPU,
      limitMemory,
      requestCPU,
      requestMemory,
      capacity: capacity / 1024,
      replicas,
    })

    return manifest
  }

  async updateState(appid: string, state: DedicatedDatabaseState) {
    const db = SystemDatabase.db
    const res = await db
      .collection<DedicatedDatabase>('DedicatedDatabase')
      .findOneAndUpdate(
        { appid },
        { $set: { state, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    return res.value
  }

  getDatabaseNamespace(region: Region, appid: string) {
    const emptyManifest = this.makeDeployManifest(region, appid)
    const specs = loadAllYaml(emptyManifest)
    assert(
      specs && specs.length > 0,
      'the deploy manifest of database should not be empty',
    )
    if (!specs || specs.length === 0) return null
    const spec = specs[0]
    return spec.metadata.namespace
  }

  async getConnectionUri(region: Region, database: DedicatedDatabase) {
    const api = this.cluster.makeCoreV1Api(region)
    const namespace = this.getDatabaseNamespace(region, database.appid)
    const name = getDedicatedDatabaseName(database.appid)
    // KubeBlocks v0.x+ uses new secret naming format
    // Try ${name}-mongodb-account-root first, fallback to ${name}-conn-credential
    let srv = null
    try {
      const secretName = `${name}-mongodb-account-root`
      srv = await api.readNamespacedSecret(secretName, namespace)
    } catch (error) {
      // If first secret doesn't exist (404), try the fallback
      if (error?.response?.statusCode === 404) {
        try {
          const secretName = `${name}-conn-credential`
          srv = await api.readNamespacedSecret(secretName, namespace)
        } catch (fallbackError) {
          // Both secrets don't exist, return null
          if (fallbackError?.response?.statusCode === 404) {
            return null
          }
          // Re-throw if it's not a 404 error
          throw fallbackError
        }
      } else {
        // Re-throw if it's not a 404 error
        throw error
      }
    }
    if (!srv) return null

    const username = Buffer.from(srv.body.data.username, 'base64').toString()
    const password = Buffer.from(srv.body.data.password, 'base64').toString()

    // KubeBlocks' new secret format doesn't include host/port fields
    const host = `${name}-mongodb.${namespace}.svc`
    const port = 27017

    const uri = mongodb_uri.format({
      username,
      password,
      hosts: [
        {
          host,
          port,
        },
      ],
      database: database.name,
      options: {
        authSource: 'admin',
        replicaSet: `${name}-mongodb`,
        // readPreference: 'secondaryPreferred',
        w: 'majority',
      },
      scheme: 'mongodb',
    })

    return uri
  }

  async findAndConnect(appid: string) {
    const database = await this.findOne(appid)
    if (!database) return null

    const region = await this.regionService.findByAppId(appid)
    const connectionUri = await this.getConnectionUri(region, database)

    const client = await this.mongoService.connectDatabase(
      connectionUri,
      database.name,
    )
    const db = client.db(database.name)
    return { db, client }
  }

  /**
   * Get database accessor that used for `database-proxy`
   */
  async getDatabaseAccessor(appid: string) {
    const database = await this.findOne(appid)
    if (!database) return null

    const { client } = await this.findAndConnect(appid)

    const accessor = new MongoAccessor(client)
    return accessor
  }

  async remove(appid: string) {
    const db = SystemDatabase.db
    const doc = await db
      .collection<DedicatedDatabase>('DedicatedDatabase')
      .findOneAndUpdate(
        { appid },
        {
          $set: {
            state: DedicatedDatabaseState.Deleted,
            phase: DedicatedDatabasePhase.Deleting,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )

    return doc.value
  }

  async databaseConnectionIsOk(appid: string): Promise<boolean> {
    try {
      const { client } = await this.findAndConnect(appid)
      const admin = client.db('admin')
      const replSetStatus = await admin.command({ replSetGetStatus: 1 })
      const members = replSetStatus.members
      const replicaSetOk: boolean = replSetStatus.ok === 1

      const healthyMembers = members.filter(
        (member: any) => member.health === 1,
      )

      const primary = healthyMembers.find(
        (member: any) => member.stateStr === 'PRIMARY',
      )

      const majorityCount = Math.ceil(members.length / 2)

      const isClusterHealthy =
        replicaSetOk && primary && healthyMembers.length >= majorityCount

      if (isClusterHealthy) {
        return true
      }

      return false
    } catch (error) {
      this.logger.verbose(
        `dedicatedDatabase health check failed ${appid}\n${error.message}`,
      )
      return false
    }
  }

  /**
   * Handle KubeBlock v5 upgrade API call for horizontal scaling
   * This is a compatibility feature for KubeBlock v5 mongodb-5.0 clusters
   *
   * @param appid - Application ID
   * @param manifest - Current deployment manifest
   * @param replicas - Number of replicas
   */
  private async handleKubeBlockV5Upgrade(
    appid: string,
    manifest: KubernetesObject & { spec: any; status: any },
    replicas: number,
  ): Promise<void> {
    try {
      // Early return if not a v5 mongodb-5.0 cluster
      if (!this.isKubeBlockV5MongoDb(manifest)) {
        return
      }

      const url = ServerConfig.KUBEBLOCK_V5_UPGRADE_URL
      if (!url) {
        this.logger.warn(
          `KubeBlock v5 upgrade URL not configured (KUBEBLOCK_V5_UPGRADE_URL env var not set) for ${appid}`,
        )
        return
      }

      await this.callKubeBlockV5UpgradeAPI(appid, manifest, replicas, url)
    } catch (error) {
      this.logger.error(
        `Failed to call KubeBlock v5 upgrade API for ${appid}: ${error.message}`,
      )
      // Don't throw error, just log it as it's a compatibility feature
    }
  }

  /**
   * Check if the manifest is a KubeBlock v5 mongodb-5.0 cluster
   */
  private isKubeBlockV5MongoDb(
    manifest: KubernetesObject & { spec: any; status: any },
  ): boolean {
    return (
      manifest?.metadata?.labels?.['clusterversion.kubeblocks.io/name'] ===
      'mongodb-5.0'
    )
  }

  /**
   * Call KubeBlock v5 upgrade API with timeout control
   */
  private async callKubeBlockV5UpgradeAPI(
    appid: string,
    manifest: KubernetesObject & { spec: any; status: any },
    replicas: number,
    url: string,
  ): Promise<void> {
    const clusterName = manifest.metadata.name
    const namespace = manifest.metadata.namespace

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      KUBEBLOCK_V5_UPGRADE_API_TIMEOUT,
    )

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace,
          database_name: clusterName,
          replicas,
        }),
        signal: controller.signal,
      })

      const responseData = await this.parseKubeBlockV5Response(response)

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, statusText: ${
            response.statusText
          }, body: ${JSON.stringify(responseData)}`,
        )
      }

      this.logger.log(
        `Called KubeBlock v5 upgrade API for ${appid}: cluster=${clusterName}, replicas=${replicas}, response: ${JSON.stringify(
          responseData,
        )}`,
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Parse response body from KubeBlock v5 API
   */
  private async parseKubeBlockV5Response(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return await response.json()
    }
    return await response.text()
  }
}
