import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceById } from '../common/getter'
import { KubernetesService } from '../core/kubernetes.service'
import { Database } from './api/database.cr'
import { MongoClient } from 'mongodb'
import * as assert from 'node:assert'

@Injectable()
export class DatabaseCoreService {
  private readonly logger = new Logger(DatabaseCoreService.name)

  constructor(private readonly k8sService: KubernetesService) {}

  /**
   * Find a database and connect to it
   * @param appid
   * @returns
   */
  async findAndConnect(appid: string) {
    const database = await this.findOne(appid)
    assert(database, 'Database not found')

    const client = await this.connectDatabase(database)
    const db = client.db(database.metadata.name)
    return { db, client }
  }

  /**
   * Get the database of an app
   * @param appid
   * @returns
   */
  async findOne(appid: string) {
    assert(appid, 'appid is required')
    const namespace = GetApplicationNamespaceById(appid)
    const name = appid
    try {
      const res =
        await this.k8sService.customObjectApi.getNamespacedCustomObject(
          Database.GVK.group,
          Database.GVK.version,
          namespace,
          Database.GVK.plural,
          name,
        )
      return res.body as Database
    } catch (err) {
      this.logger.error(err)
      if (err?.response?.body?.reason === 'NotFound') {
        return null
      }
      throw err
    }
  }

  /**
   * Connect to database
   */
  async connectDatabase(db: Database) {
    assert(db, 'Database is required')
    assert(db.status, 'Database status is required')
    assert(db.status.connectionUri, 'Database connection uri is required')

    const uri = db.status?.connectionUri
    const client = new MongoClient(uri, { maxPoolSize: 1, minPoolSize: 0 })
    try {
      this.logger.verbose(`Connecting to database ${db.metadata.name}`)
      await client.connect()
      this.logger.log(`Connected to database ${db.metadata.namespace}`)
      return client
    } catch {
      this.logger.error(
        `Failed to connect to database ${db.metadata.namespace}`,
      )
      await client.close()
      return null
    }
  }
}
