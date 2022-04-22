/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-08 01:58:51
 * @Description: 
 */

import { MongoAccessor } from 'database-proxy'
import Config from './config'
import { createLogger, logger } from './support/logger'
import * as mongodb_uri from 'mongodb-uri'
import * as assert from 'assert'

/**
 * Database agent class
 */
export class DatabaseAgent {
  private static _sys_accessor: MongoAccessor = DatabaseAgent.createAccessor(Config.SYS_DB_URI)

  /**
   * sys mongo accessor instance
   */
  static get sys_accessor() {
    return this._sys_accessor
  }

  /**
   * mongo db instance
   * @returns 
   */
  static get db() {
    return this._sys_accessor.db
  }

  /**
   * Parse the connection uri of mongodb
   * @param uri the connection uri of mongodb
   * @returns 
   */
  static parseConnectionUri(uri: string) {
    assert.ok(uri, 'empty db connection uri got')

    const parsed = mongodb_uri.parse(uri)
    parsed.database = parsed.database || parsed.options['authSource']
    assert.ok(parsed.database, 'no database and authSource set in connection uri')

    return parsed
  }

  /**
   * Create MongoAccessor instance
   * @param database db name
   * @param uri connection uri of mongodb
   * @param poolSize max number of connection pool size
   * @returns 
   */
  private static createAccessor(uri: string) {
    const { database } = this.parseConnectionUri(uri)
    const accessor = new MongoAccessor(database, uri)

    accessor.setLogger(createLogger(`accessor:${database}`, Config.DB_LOG_LEVEL))
    accessor.init()
      .then(() => {
        logger.info(`db:${database} connected`)
      })
      .catch(error => {
        logger.error(`db:${database} connect failed`, error)
        process.exit(1)
      })

    return accessor
  }
}
