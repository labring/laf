import { Injectable, Logger } from '@nestjs/common'
import * as assert from 'node:assert'
import { MongoAccessor } from 'database-proxy'
import { GenerateAlphaNumericPassword } from 'src/utils/random'
import { MongoService } from './mongo.service'
import * as mongodb_uri from 'mongodb-uri'
import { RegionService } from 'src/region/region.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { Region } from 'src/region/entities/region'
import { SystemDatabase } from '../system-database'
import {
  Database,
  DatabasePermission,
  DatabasePhase,
  DatabaseState,
} from './entities/database'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { DatabaseSyncRecord } from './entities/database-sync-record'
import { MongoClient, ObjectId } from 'mongodb'

const p_exec = promisify(exec)

@Injectable()
export class DatabaseService {
  private readonly db = SystemDatabase.db
  private readonly logger = new Logger(DatabaseService.name)

  constructor(
    private readonly mongoService: MongoService,
    private readonly regionService: RegionService,
  ) {}

  async create(appid: string) {
    const region = await this.regionService.findByAppId(appid)

    const username = appid
    const dbName = appid
    const password = GenerateAlphaNumericPassword(64)

    // create app database in mongodb
    const res = await this.mongoService.createDatabase(
      region,
      dbName,
      username,
      password,
    )

    assert.equal(res.ok, 1, 'Create app database failed: ' + appid)

    // create app database in database
    await this.db.collection<Database>('Database').insertOne({
      appid: appid,
      name: dbName,
      user: username,
      password: password,
      state: DatabaseState.Active,
      phase: DatabasePhase.Created,
      dataSize: 0,
      lockedAt: TASK_LOCK_INIT_TIME,
      usageCaptureLockedAt: TASK_LOCK_INIT_TIME,
      usageLimitLockedAt: TASK_LOCK_INIT_TIME,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const database = await this.findOne(appid)
    return database
  }

  async findOne(appid: string) {
    const database = await this.db
      .collection<Database>('Database')
      .findOne({ appid })

    return database
  }

  async delete(database: Database) {
    const region = await this.regionService.findByAppId(database.appid)

    // delete app database in mongodb
    const res = await this.mongoService.deleteDatabase(region, database.name)
    if (!res) return false

    // delete app database in database
    const doc = await this.db
      .collection<Database>('Database')
      .deleteOne({ appid: database.appid })

    return doc
  }

  // Get application internal database connection uri
  getInternalConnectionUri(region: Region, database: Database) {
    // build app db connection uri from config
    const parsed = mongodb_uri.parse(region.databaseConf.connectionUri)
    parsed.database = database.name
    parsed.username = database.user
    parsed.password = database.password
    parsed.options['authSource'] = database.name

    return mongodb_uri.format(parsed)
  }

  // Get application control database connection uri
  getControlConnectionUri(region: Region, database: Database) {
    // build app db connection uri from config
    const parsed = mongodb_uri.parse(region.databaseConf.controlConnectionUri)
    parsed.database = database.name
    parsed.username = database.user
    parsed.password = database.password
    parsed.options['authSource'] = database.name

    return mongodb_uri.format(parsed)
  }

  /**
   * Get database accessor that used for `database-proxy`
   */
  async getDatabaseAccessor(appid: string) {
    const { client } = await this.findAndConnect(appid)
    const accessor = new MongoAccessor(client)
    return accessor
  }

  /**
   * Find a database and connect to it
   */
  async findAndConnect(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    const database = await this.findOne(appid)
    if (!database) return null

    const connectionUri = this.getControlConnectionUri(region, database)

    const client = await this.mongoService.connectDatabase(
      connectionUri,
      database.name,
    )
    const db = client.db(database.name)
    return { db, client }
  }

  async revokeWritePermission(name: string, username: string, region: Region) {
    const conf = region.databaseConf
    const client = new MongoClient(conf.controlConnectionUri)

    try {
      await client.connect()
      const db = client.db(name)
      const result = await db.command({
        updateUser: username,
        roles: [
          { role: DatabasePermission.Read, db: name },
          { role: 'dbAdmin', db: name },
        ],
      })
      this.logger.log(`Revoke write permission of ${username} on ${name}`)
      return result
    } catch (error) {
      this.logger.error(
        `Revoke write permission of ${username} on ${name} error : `,
        error,
      )
      throw error
    } finally {
      await client.close()
    }
  }

  async grantWritePermission(name: string, username: string, region: Region) {
    const conf = region.databaseConf
    const client = new MongoClient(conf.controlConnectionUri)

    try {
      await client.connect()
      const db = client.db(name)
      const result = await db.command({
        updateUser: username,
        roles: [
          { role: DatabasePermission.ReadWrite, db: name },
          { role: 'dbAdmin', db: name },
        ],
      })
      this.logger.warn(`Grant write permission to ${username} on ${name}`)
      return result
    } catch (error) {
      this.logger.error(
        `Grant write permission to ${username} on ${name} error : `,
        error,
      )
      throw error
    } finally {
      await client.close()
    }
  }

  async getUserPermission(name: string, username: string, region: Region) {
    const conf = region.databaseConf
    const client = new MongoClient(conf.controlConnectionUri)

    try {
      await client.connect()
      const db = client.db(name)
      const result = await db.command({
        usersInfo: { user: username, db: name },
      })
      const permission =
        result?.users?.[0].roles.findIndex(
          (v) => v.role === DatabasePermission.ReadWrite,
        ) !== -1
          ? DatabasePermission.ReadWrite
          : DatabasePermission.Read
      return permission
    } catch (error) {
      this.logger.error(
        `Get user permission of ${username} on ${name} error : `,
        error,
      )
      throw error
    } finally {
      await client.close()
    }
  }

  async exportDatabase(appid: string, filePath: string, uid: ObjectId) {
    const region = await this.regionService.findByAppId(appid)
    const database = await this.findOne(appid)
    assert(database, 'Database not found')

    const connectionUri = this.getControlConnectionUri(region, database)
    assert(connectionUri, 'Database connection uri not found')

    try {
      await p_exec(
        `mongodump --uri='${connectionUri}' --gzip --archive=${filePath}`,
      )
      await this.db
        .collection<DatabaseSyncRecord>('DatabaseSyncRecord')
        .insertOne({ uid, createdAt: new Date() })
    } catch (error) {
      this.logger.error(`failed to export db ${appid}`, error)
      throw error
    }
  }

  async importDatabase(
    appid: string,
    dbName: string,
    filePath: string,
    uid: ObjectId,
  ): Promise<void> {
    const region = await this.regionService.findByAppId(appid)
    const database = await this.findOne(appid)
    assert(database, 'Database not found')

    const connectionUri = this.getControlConnectionUri(region, database)
    assert(connectionUri, 'Database connection uri not found')

    try {
      await p_exec(
        `mongorestore --uri='${connectionUri}' --gzip --archive='${filePath}' --nsFrom="${dbName}.*" --nsTo="${appid}.*" -v --nsInclude="${dbName}.*"`,
      )
      await this.db
        .collection<DatabaseSyncRecord>('DatabaseSyncRecord')
        .insertOne({ uid, createdAt: new Date() })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`failed to import db to ${appid}:`, error)
      throw error
    }
  }
}
