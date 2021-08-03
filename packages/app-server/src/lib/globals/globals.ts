

import { MongoAccessor, getDb, LoggerInterface } from 'less-api'
import { Db } from 'less-api-database'
import Config from '../../config'
import { RequireFuncType } from 'cloud-function-engine'
import { createLogger } from '../logger'


const require_func: RequireFuncType = (module): any => {
  if (module === '@/cloud-sdk') {
    return require('../../cloud-sdk')
  }
  return require(module) as any
}

/**
 * 管理应用的全局对象
 */
export class Globals {
  private static _accessor: MongoAccessor = null
  private static _db: Db = null
  private static _logger: LoggerInterface = null

  static get accessor() {
    return this._accessor
  }

  static get db() {
    return this._db
  }

  static get logger() {
    return this._logger
  }

  /**
   * 自定义 require function
   * @see 详见 CloudFunction.require_func 和 FunctionEngine.require_func
   * @param module 
   * @returns 
   */
  static get require_func(): RequireFuncType {
    return require_func
  }

  /**
   * 初始化应用资源
   */
  static init() {
    this._initGlobalObjects()

    Object.freeze(Globals)
  }

  /**
   * 初始化全局对象
   */
  private static _initGlobalObjects() {
    // 创建全局日志对象
    if (null === this._logger) {
      this._logger = createLogger('server')
    }

    // 创建 app db accessor
    if (null === this._accessor) {
      this._accessor = this._createAccessor()
    }

    // 创建 Db ORM 实例
    if (null === this._db) {
      this._db = this.createDb()
    }
  }

  /**
   * 创建 Db 实例
   * @returns 
   */
  static createDb() {
    if (null === this._accessor) {
      throw new Error('Globals.accessor is empty, please run Globals.init() before!')
    }
    return getDb(this._accessor)
  }


  /**
   * 创建 MongoAccessor 对象
   * @returns 
   */
  private static _createAccessor() {
    const accessor = new MongoAccessor(Config.db.database, Config.db.uri, { directConnection: true, maxPoolSize: Config.db.poolSize })

    accessor.setLogger(createLogger('db', 'warning'))
    accessor.init()

    return accessor
  }
}
