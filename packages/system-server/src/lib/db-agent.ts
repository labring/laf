/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-30 17:21:43
 * @Description: 
 */

import { MongoAccessor, getDb } from 'less-api'
import Config from '../config'
import { createLogger } from './logger'


/**
 * Database agent class
 */
export class DatabaseAgent {
  private static _sys_accessor: MongoAccessor = DatabaseAgent.createAccessor(Config.sys_db.database, Config.sys_db.uri, Config.sys_db.poolSize)

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
   * Create MongoAccessor instance
   * @param database db name
   * @param uri connection uri of mongodb
   * @param poolSize max number of connection pool size
   * @returns 
   */
  private static createAccessor(database: string, uri: string, poolSize: number) {
    const accessor = new MongoAccessor(database, uri, { maxPoolSize: poolSize, directConnection: true })

    const logger = createLogger(`accessor:${database}`, 'warning')
    accessor.setLogger(logger)
    accessor.init().then(() => {
      logger.info(`db:${database} connected`)
    }).catch(error => {
      logger.error(`db:${database} connect failed`, error)
      process.exit(1)
    })

    return accessor
  }
}
