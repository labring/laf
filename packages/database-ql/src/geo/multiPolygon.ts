import { SYMBOL_GEO_POLYGON } from '../helper/symbol'
import { isArray, isNumber } from '../utils/type'
import { Polygon } from './polygon'
import { ISerializedMultiPolygon } from './interface'


/**
 * 多个面
 *
 * @author starkewang
 */
export class MultiPolygon {

    readonly polygons: Polygon[]

    /**
     * 初始化
     *
     * @param polygons    - Polygon[]
     */
    constructor(polygons: Polygon[]) {
      if (!isArray(polygons)) {
        throw new TypeError(`"polygons" must be of type Polygon[]. Received type ${typeof polygons}`)
      }
      if (polygons.length === 0) {
        throw new Error('MultiPolygon must contain 1 polygon at least')
      }
      for (let polygon of polygons) {
        if (!(polygon instanceof Polygon)) {
          throw new TypeError(`"polygon" must be of type Polygon[]. Received type ${typeof polygon}[]`)
        }
      }

      this.polygons = polygons
    }

    parse(key) {
      return {
        [key]: {
          type: 'MultiPolygon',
          coordinates: this.polygons.map(polygon => {
            return polygon.lines.map(line => {
              return line.points.map(point => [point.longitude, point.latitude])
            })
          })
        }
      }
    }

    toJSON() {
      return {
        type: 'MultiPolygon',
        coordinates: this.polygons.map(polygon => {
          return polygon.lines.map(line => {
            return line.points.map(point => [point.longitude, point.latitude])
          })
        })
      }
    }

    static validate(multiPolygon: ISerializedMultiPolygon) {
      if (multiPolygon.type !== 'MultiPolygon' || !isArray(multiPolygon.coordinates)) {
        return false
      }
      for (let polygon of multiPolygon.coordinates) {
        for (let line of polygon) {
          for (let point of line) {
            if (!isNumber(point[0]) || !isNumber(point[1])) {
              return false
            }
          }
        }
      }
      return true
    }

    get _internalType() {
      return SYMBOL_GEO_POLYGON
    }
}
