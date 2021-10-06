/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-16 15:29:15
 * @LastEditTime: 2021-10-06 20:34:59
 * @Description: 
 */


import { MongoAccessor } from 'database-proxy'
import Config from '../../config'
import { createLogger, logger } from '../logger'


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
   * Database instance
   */
  static get db() {
    return this._accessor?.db
  }

  /**
   * Create MongoAccessor instance
   * @returns 
   */
  private static _createAccessor() {
    const accessor = new MongoAccessor(Config.db.database, Config.db.uri, { directConnection: true, maxPoolSize: Config.db.maxPoolSize })

    accessor.setLogger(createLogger('accessor', 'warning'))
    accessor.init()
      .then(async () => {
        logger.info('db connected')
      })
      .catch(error => {
        logger.error(error)
        setTimeout(() => process.exit(101), 0)
      })

    return accessor
  }
}
