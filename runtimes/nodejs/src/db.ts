/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-16 15:29:15
 */

import { MongoAccessor } from 'database-proxy'
import Config from './config'
import { MongoClient } from 'mongodb'

/**
 * Database Management
 */
export class DatabaseAgent {
  private static _accessor: MongoAccessor
  private static _client: MongoClient
  static ready = this.initialize()

  /**
   * Mongo client
   */
  static get client() {
    return this._client
  }

  /**
   * Database instance
   */
  static get db() {
    return this.client.db()
  }

  static initialize() {
    this._client = new MongoClient(Config.DB_URI)
    return this._client.connect()
  }

  /**
   * MongoAccessor instance of database-proxy
   */
  static get accessor() {
    if (!this._accessor) {
      this._accessor = new MongoAccessor(this.client)
      this._accessor.logger.level = 0
    }
    return this._accessor
  }
}
