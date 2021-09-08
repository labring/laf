/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-08 23:07:02
 * @Description: 
 */

import { MongoAccessor, getDb } from 'less-api'
import Config from '../config'
import { createLogger, logger } from './logger'
import * as mongodb_uri from 'mongodb-uri'
import * as assert from 'assert'

/**
 * Database agent class
 */
export class DatabaseAgent {
  private static _sys_accessor: MongoAccessor = DatabaseAgent.createAccessor(Config.sys_db_uri)

  /**
   * sys mongo accessor instance
   */
  static get sys_accessor() {
    return this._sys_accessor
  }

  /**
   * sys database ORM instance
   */
  static get sys_db() {
    return this.createSysDb()
  }

  /**
   * Create sys database ORM instance
   * @returns 
   */
  static createSysDb() {
    if (null === this._sys_accessor) {
      throw new Error('Globals.sys_accessor is empty, please run Globals.init() before!')
    }
    return getDb(this._sys_accessor)
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
