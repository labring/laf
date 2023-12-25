import { Logger } from '@nestjs/common'
import { MongoClient } from 'mongodb'
import { ServerConfig } from 'src/constants'
import * as assert from 'node:assert'

export class SystemDatabase {
  private static readonly logger = new Logger(SystemDatabase.name)
  private static _client: MongoClient
  static ready = this.initialize()

  static get client() {
    return this._client
  }

  static get db() {
    return this.client.db()
  }

  static async initialize() {
    assert.ok(ServerConfig.DATABASE_URL, 'DATABASE_URL is required')
    this._client = new MongoClient(ServerConfig.DATABASE_URL)
    try {
      const client = await this._client.connect()
      this.logger.log('Connected to system database')
      return client
    } catch (err) {
      this.logger.error('Failed to connect to system database')
      this.logger.error(err)
      process.exit(1)
    }
  }
}
