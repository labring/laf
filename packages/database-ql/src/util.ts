import { Binary, EJSON, ObjectId } from 'bson'
import { FieldType } from './constant'
import { Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon } from './geo/index'
import { ServerDate } from './serverDate/index'

interface DocumentModel {
  _id: string
}

/**
 * 工具模块
 *
 */
export class Util {
  /**
   * 格式化后端返回的文档数据
   *
   * @param document - 后端文档数据
   */
  public static formatResDocumentData = (documents: DocumentModel[]) => {
    return documents.map(document => {
      return Util.formatField(document)
    })
  }

  /**
   * 格式化字段
   *
   * 主要是递归数组和对象，把地理位置和日期时间转换为js对象。
   *
   * @param document
   * @internal
   */
  public static formatField = document => {
    const keys = Object.keys(document)
    let protoField = {}

    // 数组递归的情况
    if (Array.isArray(document)) {
      protoField = []
    }

    keys.forEach(key => {
      const item = document[key]
      const type = Util.whichType(item)
      let realValue
      switch (type) {
        case FieldType.GeoPoint:
          realValue = new Point(item.coordinates[0], item.coordinates[1])
          break
        case FieldType.GeoLineString:
          realValue = new LineString(item.coordinates.map(point => new Point(point[0], point[1])))
          break
        case FieldType.GeoPolygon:
          realValue = new Polygon(
            item.coordinates.map(
              line => new LineString(line.map(([lng, lat]) => new Point(lng, lat)))
            )
          )
          break
        case FieldType.GeoMultiPoint:
          realValue = new MultiPoint(item.coordinates.map(point => new Point(point[0], point[1])))
          break
        case FieldType.GeoMultiLineString:
          realValue = new MultiLineString(
            item.coordinates.map(
              line => new LineString(line.map(([lng, lat]) => new Point(lng, lat)))
            )
          )
          break
        case FieldType.GeoMultiPolygon:
          realValue = new MultiPolygon(
            item.coordinates.map(
              polygon =>
                new Polygon(
                  polygon.map(line => new LineString(line.map(([lng, lat]) => new Point(lng, lat))))
                )
            )
          )
          break
        case FieldType.Timestamp:
          realValue = new Date(item.$timestamp * 1000)
          break
        case FieldType.Object:
        case FieldType.Array:
          realValue = Util.formatField(item)
          break
        case FieldType.ServerDate:
          realValue = new Date(item.$date)
          break
        case FieldType.ObjectId:
          realValue = EJSON.deserialize(item)
          break
        case FieldType.Binary:
          realValue = EJSON.deserialize(item)
          break
        default:
          realValue = item
      }

      if (Array.isArray(protoField)) {
        protoField.push(realValue)
      } else {
        protoField[key] = realValue
      }
    })
    return protoField
  }

  /**
   * 查看数据类型
   *
   * @param obj
   */
  public static whichType = (obj: any): String => {
    let type = Object.prototype.toString.call(obj).slice(8, -1)

    if (type === FieldType.Timestamp) {
      return FieldType.BsonDate
    }

    if (type === FieldType.Object) {
      if (obj instanceof Point) {
        return FieldType.GeoPoint
      } else if (obj instanceof Date) {
        return FieldType.Timestamp
      } /* else if (obj instanceof Command) {
        return FieldType.Command;
      } */ else if (
        obj instanceof ServerDate
      ) {
        return FieldType.ServerDate
      } else if (obj instanceof ObjectId) {
        return FieldType.ObjectId
      } else if (obj instanceof Binary) {
        return FieldType.Binary
      }

      if (obj.$timestamp) {
        type = FieldType.Timestamp
      } else if (obj.$date) {
        type = FieldType.ServerDate
      } else if (Point.validate(obj)) {
        type = FieldType.GeoPoint
      } else if (LineString.validate(obj)) {
        type = FieldType.GeoLineString
      } else if (Polygon.validate(obj)) {
        type = FieldType.GeoPolygon
      } else if (MultiPoint.validate(obj)) {
        type = FieldType.GeoMultiPoint
      } else if (MultiLineString.validate(obj)) {
        type = FieldType.GeoMultiLineString
      } else if (MultiPolygon.validate(obj)) {
        type = FieldType.GeoMultiPolygon
      } else if (obj.$oid) {
        type = FieldType.ObjectId
      } else if (obj.$binary) {
        type = FieldType.Binary
      }
    }
    return type
  }
}
