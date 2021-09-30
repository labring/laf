import { SYMBOL_GEO_MULTI_LINE_STRING } from '../helper/symbol'
import { isArray, isNumber } from '../utils/type'
import { LineString } from './lineString'
import { ISerializedMultiLineString } from './interface'


/**
 * 多个 LineString
 *
 * @author starkewang
 */
export class MultiLineString {

    readonly lines: LineString[]

    /**
     * 初始化
     *
     * @param lines    - LineString
     */
    constructor(lines: LineString[]) {
      if (!isArray(lines)) {
        throw new TypeError(`"lines" must be of type LineString[]. Received type ${typeof lines}`)
      }
      if (lines.length === 0) {
        throw new Error('Polygon must contain 1 linestring at least')
      }
      lines.forEach(line => {
        if (!(line instanceof LineString)) {
          throw new TypeError(`"lines" must be of type LineString[]. Received type ${typeof line}[]`)
        }
      })

      this.lines = lines
    }

    parse(key) {
      return {
        [key]: {
          type: 'MultiLineString',
          coordinates: this.lines.map(line => {
            return line.points.map(point => [point.longitude, point.latitude])
          })
        }
      }
    }

    toJSON() {
      return {
        type: 'MultiLineString',
        coordinates: this.lines.map(line => {
          return line.points.map(point => [point.longitude, point.latitude])
        })
      }
    }

    static validate(multiLineString: ISerializedMultiLineString) {
      if (multiLineString.type !== 'MultiLineString' || !isArray(multiLineString.coordinates)) {
        return false
      }
      for (let line of multiLineString.coordinates) {
        for (let point of line) {
          if (!isNumber(point[0]) || !isNumber(point[1])) {
            return false
          }
        }
      }
      return true
    }

    get _internalType() {
      return SYMBOL_GEO_MULTI_LINE_STRING
    }
}
