import {Db, MongoClient} from 'mongodb'
import {logger} from './logger'
import * as mongodb_uri from 'mongodb-uri'
import * as assert from 'assert'

/**
 * Database agent class
 */
export class DatabaseAgent {
  private static _db: Db
  private static _conn: MongoClient

  /**
   * mongo db instance
   * @returns
   */
  static get db() {
    return this._db
  }

  /**
   * mongo client connection
   */
  static get conn() {
    return this._conn
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
   * Create Mongodb database instance
   * @param uri connection uri of mongodb
   * @returns
   */
  static init(uri: string) {
    const {database} = this.parseConnectionUri(uri)

    const client = new MongoClient(uri)
    client.connect().then(() => {
      logger.info(`db:${database} connected`)
      this._db = client.db(database)
      this._conn = client
    }).catch(error => {
      logger.error(`db:${database} connect failed`, error)
      process.exit(1)
    })
  }
}

