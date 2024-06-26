import { Injectable } from '@nestjs/common'
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

const getDedicatedDatabaseName = (appid: string) => appid

@Injectable()
export class DedicatedDatabaseService {
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
    const secretName = `${name}-conn-credential`
    const srv = await api.readNamespacedSecret(secretName, namespace)
    if (!srv) return null

    const username = Buffer.from(srv.body.data.username, 'base64').toString()
    const password = Buffer.from(srv.body.data.password, 'base64').toString()
    let host = Buffer.from(srv.body.data.headlessHost, 'base64').toString()
    if (host && !host.includes(namespace)) {
      host += `.${namespace}`
    }
    const port = Number(
      Buffer.from(srv.body.data.headlessPort, 'base64').toString(),
    )

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
        readPreference: 'secondaryPreferred',
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
}
