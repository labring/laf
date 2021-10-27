/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-16 15:29:15
 * @LastEditTime: 2021-10-26 18:41:47
 * @Description:
 */


import { Db, MongoClient } from 'mongodb'
import * as mongodb_uri from 'mongodb-uri'
import Config from '../config'
import { logger } from './logger'


/**
 * Database Management
 */
export class DatabaseAgent {
  private static _conn: MongoClient = this._createConnection()
  private static _db: Db
  private static _ready: Promise<MongoClient> = new Promise(() => { })

  /**
   * Promise object to wait db connection ready
   */
  static get ready() {
    return this._ready
  }

  /**
   * Mongodb Database instance
   */
  static get db() {
    return this._db
  }

  /**
   * Mongodb connection
   */
  static get conn() {
    return this._conn
  }

  /**
   * Create connection
   * @returns 
   */
  private static _createConnection() {
    const { database } = mongodb_uri.parse(Config.DB_URI)
    const conn = new MongoClient(Config.DB_URI)

    this._ready = conn.connect()
      .then(ret => {
        this._db = ret.db(database)
        logger.info(`mongo accessor connected, db: ` + database)
        return ret
      })

    return conn
  }
}
