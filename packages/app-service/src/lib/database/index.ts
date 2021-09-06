/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-16 15:29:15
 * @LastEditTime: 2021-08-17 14:05:12
 * @Description: 
 */


import { MongoAccessor, getDb } from 'less-api'
import * as assert from 'assert'
import Config from '../../config'
import { createLogger } from '../logger'


/**
 * Database Management
 */
export class DatabaseAgent {
  private static _accessor: MongoAccessor = DatabaseAgent._createAccessor()

  /**
   * MongoAccessor instance
   */
  static get accessor() {
    return this._accessor
  }

  /**
   * Database ORM instance
   */
  static get db() {
    return this.createDb()
  }


  /**
   * Create Database ORM instance
   * @returns 
   */
  static createDb() {
    assert(this._accessor, 'accessor is empty')
    return getDb(this._accessor)
  }


  /**
   * Create MongoAccessor instance
   * @returns 
   */
  private static _createAccessor() {
    const accessor = new MongoAccessor(Config.db.database, Config.db.uri, { directConnection: true, maxPoolSize: Config.db.maxPoolSize })

    const logger = createLogger('accessor', 'warning')
    accessor.setLogger(logger)
    accessor.init()
      .then(() => {
        logger.info('db connected')
      })
      .catch(error => {
        logger.error(error)
        process.exit(1)
      })

    return accessor
  }
}
