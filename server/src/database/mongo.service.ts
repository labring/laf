import { Injectable, Logger } from '@nestjs/common'
import { Region } from '@prisma/client'
import { MongoClient } from 'mongodb'
import * as assert from 'node:assert'

@Injectable()
export class MongoService {
  private readonly logger = new Logger(MongoService.name)

  /**
   * Create mongodb database in region
   * @param region
   * @param name database name
   * @param username database username
   * @param password database password
   * @returns
   */
  async createDatabase(
    region: Region,
    name: string,
    username: string,
    password: string,
  ) {
    const conf = region.databaseConf
    const client = new MongoClient(conf.connectionUri)

    try {
      await client.connect()
      const db = client.db(name)
      const result = await db.addUser(username, password, {
        roles: [
          { role: 'readWrite', db: name },
          { role: 'dbAdmin', db: name },
        ],
      })
      return result
    } finally {
      await client.close()
    }
  }

  /**
   * Delete mongodb database in region
   * @param region
   * @param name database name
   * @returns
   */
  async deleteDatabase(region: Region, name: string) {
    const conf = region.databaseConf
    const client = new MongoClient(conf.connectionUri)

    try {
      await client.connect()
      const result = await client.db(name).dropDatabase()
      return result
    } finally {
      await client.close()
    }
  }

  /**
   * Connect to database
   */
  async connectDatabase(connectionUri: string, dbName?: string) {
    assert(connectionUri, 'Database connection uri is required')

    const client = new MongoClient(connectionUri)
    try {
      this.logger.verbose(`Connecting to database ${dbName}`)
      await client.connect()
      this.logger.log(`Connected to database ${dbName}`)
      return client
    } catch {
      this.logger.error(`Failed to connect to database ${dbName}`)
      await client.close()
      return null
    }
  }
}
