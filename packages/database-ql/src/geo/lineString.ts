import { SYMBOL_GEO_LINE_STRING } from '../helper/symbol'
import { Point } from './point'
import { isArray, isNumber } from '../utils/type'
import { ISerializedLineString } from './interface'

/**
 * 线段
 *
 * @author starkewang
 */
export class LineString {

    readonly points: Point[]

    /**
     * 初始化
     *
     * @param points    - GeoPoint
     */
    constructor(points: Point[]) {
      if (!isArray(points)) {
        throw new TypeError(`"points" must be of type Point[]. Received type ${typeof points}`)
      }
      if (points.length < 2) {
        throw new Error('"points" must contain 2 points at least')
      }
      points.forEach(point => {
        if (!(point instanceof Point)) {
          throw new TypeError(`"points" must be of type Point[]. Received type ${typeof point}[]`)
        }
      })

      this.points = points
    }

    parse(key) {
      return {
        [key]: {
          type: 'LineString',
          coordinates: this.points.map(point => point.toJSON().coordinates)
        }
      }
    }

    toJSON() {
      return {
        type: 'LineString',
        coordinates: this.points.map(point => point.toJSON().coordinates)
      }
    }

    static validate(lineString: ISerializedLineString) {
      if (lineString.type !== 'LineString' || !isArray(lineString.coordinates)) {
        return false
      }
      for (let point of lineString.coordinates) {
        if (!isNumber(point[0]) || !isNumber(point[1])) {
          return false
        }
      }
      return true
    }

    static isClosed(lineString: LineString) {
      const firstPoint = lineString.points[0]
      const lastPoint = lineString.points[lineString.points.length - 1]

      if (firstPoint.latitude === lastPoint.latitude && firstPoint.longitude === lastPoint.longitude) {
        return true
      }
    }

    get _internalType() {
      return SYMBOL_GEO_LINE_STRING
    }
}
