/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 16:41:36
 * @Description: 
 */

import { MongoAccessor, getDb } from 'less-api'
import Config from '../config'
import { createLogger } from './logger'


/**
 * Database agent class
 * - sys db: devops server using, to storage the definition content of application, like cloud functions, triggers, policies and etc.
 * - app db: app server using, to storage application data.
 */
export class DatabaseAgent {
  private static _sys_accessor: MongoAccessor = DatabaseAgent._createAccessor(Config.sys_db.database, Config.sys_db.uri, Config.sys_db.poolSize)
  private static _app_accessor: MongoAccessor = DatabaseAgent._createAccessor(Config.app_db.database, Config.app_db.uri, Config.app_db.poolSize)

  /**
   * sys mongo accessor instance
   */
  static get sys_accessor() {
    return this._sys_accessor
  }

  /**
   * app mongo accessor instance
   */
  static get app_accessor() {
    return this._app_accessor
  }

  /**
   * sys database ORM instance
   */
  static get sys_db() {
    return this.createSysDb()
  }

  /**
   * app database ORM instance
   */
  static get app_db() {
    return this.createAppDb()
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
   * Create app database ORM instance
   * @returns 
   */
  static createAppDb() {
    if (null === this._app_accessor) {
      throw new Error('Globals.app_accessor is empty, please run Globals.init() before!')
    }
    return getDb(this._app_accessor)
  }

  /**
   * Create MongoAccessor instance
   * @param database db name
   * @param uri connection uri of mongodb
   * @param poolSize max number of connection pool size
   * @returns 
   */
  private static _createAccessor(database: string, uri: string, poolSize: number) {
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
