/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-16 15:29:15
 * @LastEditTime: 2022-02-03 00:42:33
 * @Description:
 */

import { LoggerInterface, MongoAccessor } from 'database-proxy'
import Config from './config'
import * as mongodb_uri from 'mongodb-uri'
import { logger } from './support/logger'


// Define a noop logger for mongo accessor
class AccessorLogger implements LoggerInterface {
  level: number = 0
  trace(..._params: any[]): void {
  }

  debug(..._params: any[]): void {
  }

  info(..._params: any[]): void {
  }

  warn(..._params: any[]): void {
  }

  error(..._params: any[]): void {
  }

  fatal(..._params: any[]): void {
  }

}

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

    const accessorLogger = new AccessorLogger()
    accessor.setLogger(accessorLogger)
    accessor
      .init()
      .then(async () => {
        logger.info('db connected')
      })
      .catch((error) => {
        logger.error(error)
        setTimeout(() => process.exit(101), 0)
      })

    return accessor
  }
}
