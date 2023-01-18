import { Injectable, Logger } from '@nestjs/common'
import * as assert from 'node:assert'
import { MongoAccessor } from 'database-proxy'
import { PrismaService } from '../prisma.service'
import { Database, Region } from '@prisma/client'
import { GenerateAlphaNumericPassword } from 'src/utils/random'
import { MongoService } from './mongo.service'
import * as mongodb_uri from 'mongodb-uri'
import { RegionService } from 'src/region/region.service'

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name)

  constructor(
    private readonly mongoService: MongoService,
    private readonly prisma: PrismaService,
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

    this.logger.debug('Create database result: ', res)
    assert.equal(res.ok, 1, 'Create app database failed: ' + appid)

    // create app database in database
    const database = await this.prisma.database.create({
      data: {
        appid: appid,
        name: dbName,
        user: username,
        password: password,
      },
    })

    return database
  }

  async findOne(appid: string) {
    const database = await this.prisma.database.findUnique({
      where: {
        appid,
      },
    })

    return database
  }

  async delete(database: Database) {
    const region = await this.regionService.findByAppId(database.appid)

    // delete app database in mongodb
    const res = await this.mongoService.deleteDatabase(region, database.name)
    if (!res) return false

    // delete app database in database
    const doc = await this.prisma.database.delete({
      where: {
        appid: database.appid,
      },
    })

    return doc
  }

  getConnectionUri(region: Region, database: Database) {
    // build app db connection uri from config
    const parsed = mongodb_uri.parse(region.databaseConf.connectionUri)
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
    const region = await this.regionService.findByAppId(appid)
    const database = await this.findOne(appid)
    assert(database, 'Database not found')

    const dbName = database.name
    const connectionUri = this.getConnectionUri(region, database)
    assert(connectionUri, 'Database connection uri not found')

    const accessor = new MongoAccessor(dbName, connectionUri)
    await accessor.init()
    return accessor
  }

  /**
   * Find a database and connect to it
   */
  async findAndConnect(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    const database = await this.findOne(appid)
    assert(database, 'Database not found')

    const connectionUri = this.getConnectionUri(region, database)

    const client = await this.mongoService.connectDatabase(
      connectionUri,
      database.name,
    )
    const db = client.db(database.name)
    return { db, client }
  }
}
