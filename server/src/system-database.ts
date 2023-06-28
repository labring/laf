import { Logger } from '@nestjs/common'
import { MongoClient } from 'mongodb'
import { ServerConfig } from 'src/constants'
import * as assert from 'node:assert'

export class SystemDatabase {
  private static readonly logger = new Logger(SystemDatabase.name)

  private static _conn: MongoClient = this.connect()

  private static _ready: Promise<MongoClient>

  static get client() {
    if (!this._conn) {
      this._conn = this.connect()
    }
    return this._conn
  }

  static get db() {
    return this.client.db()
  }

  static get ready() {
    assert(this.client, 'system database client can not be empty')
    return this._ready
  }

  private static connect() {
    const connectionUri = ServerConfig.DATABASE_URL
    const client = new MongoClient(connectionUri)
    this._ready = client.connect()

    this._ready
      .then(() => {
        this.logger.log('Connected to system database')
      })
      .catch((err) => {
        this.logger.error('Failed to connect to system database')
        this.logger.error(err)
        process.exit(1)
      })

    return client
  }
}
