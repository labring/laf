import * as Geo from './geo/index'
import { CollectionReference } from './collection'
import { Command } from './command'
import { ServerDateConstructor } from './serverDate/index'
import { RegExpConstructor } from './regexp/index'
import { RequestInterface } from './interface'

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

interface DbConfig {
  /**
   * Primary key, default is '_id'
   */
  primaryKey?: string

  /**
   * Request instance
   */
  request: RequestInterface
}

/**
 * 数据库模块
 *
 */
export class Db {
  /**
   * Geo 类型
   */
  readonly Geo: GeoType = Geo

  /**
   * 逻辑操作的命令
   */
  readonly command: typeof Command = Command

  readonly RegExp = RegExpConstructor

  readonly serverDate = ServerDateConstructor

  readonly primaryKey: string

  readonly request: RequestInterface

  constructor(config?: DbConfig) {
    if (!config.request) {
      throw new Error('DbConfig.request cannot be empty')
    }

    this.request = config.request
    this.primaryKey = config.primaryKey ?? '_id'
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
}
