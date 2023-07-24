import { MongoAccessor } from 'database-proxy'
import * as mongodb_uri from 'mongodb-uri'
import Config from './config'
import { createLogger, logger } from './logger'

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
    if (!database) throw new Error('db uri parse failed')
    const accessor = new MongoAccessor(database, Config.DB_URI)

    accessor.setLogger(createLogger('accessor', 'warning'))
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
