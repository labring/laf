import * as Geo from './geo/index'
import { CollectionReference } from './collection'
import { Command } from './command'
import { ServerDateConstructor } from './serverDate/index'
import { RegExpConstructor } from './regexp/index'

/**
 * 地理位置类型
*/
interface GeoType {
  Point: typeof Geo.Point
  LineString: typeof Geo.LineString
  Polygon: typeof Geo.Polygon
  MultiPoint: typeof Geo.MultiPoint
  MultiLineString: typeof Geo.MultiLineString
  MultiPolygon: typeof Geo.MultiPolygon
}

export { Query } from './query'
export { CollectionReference } from './collection'
export { DocumentReference } from './document'

/**
 * 数据库模块
 *
 * @author haroldhu
 */
export class Db {
  /**
   * Geo 类型
   */
  Geo: GeoType

  /**
   * 逻辑操作的命令
   */
  command: typeof Command

  RegExp: typeof RegExpConstructor

  serverDate: any

  /**
   * 初始化
   *
   * @param config
   */
  config: any

  // 惯例通用 primaryKey， mongo: _id, mysql: id
  get primaryKey(): string {
    return this.config?.primaryKey || '_id'
  }

  static reqClass: any

  static getAccessToken: Function

  constructor(config?: any) {
    this.config = config
    this.Geo = Geo
    this.RegExp = RegExpConstructor
    this.serverDate = ServerDateConstructor
    this.command = Command
  }

  /**
   * 获取集合的引用
   *
   * @param collName - 集合名称
   */
  collection(collName: string): CollectionReference {
    if (!collName) {
      throw new Error('Collection name is required')
    }
    return new CollectionReference(this, collName)
  }

  /**
   * 创建集合
   */
  createCollection(collName: string) {
    let request = new Db.reqClass(this.config)

    const params = {
      collectionName: collName
    }

    return request.send('database.addCollection', params)
  }
}
