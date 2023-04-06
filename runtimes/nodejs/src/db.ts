/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-16 15:29:15
 * @LastEditTime: 2022-02-03 00:42:33
 * @Description:
 */

import { MongoAccessor } from 'database-proxy'
import Config from './config'
import { createLogger, logger } from './support/logger'
import * as mongodb_uri from 'mongodb-uri'
import { FunctionCache } from './support/function-engine/cache'

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
    const { database } = mongodb_uri.parse(Config.DB_URI)
    const accessor = new MongoAccessor(database, Config.DB_URI)

    accessor.setLogger(createLogger('accessor', 'warning'))
    accessor
      .init()
      .then(async () => {
        logger.info('db connected')
        FunctionCache.initialize()
      })
      .catch((error) => {
        logger.error(error)
        setTimeout(() => process.exit(101), 0)
      })

    return accessor
  }
}
