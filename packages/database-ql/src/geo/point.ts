import { Validate } from '../validate'
import { SYMBOL_GEO_POINT } from '../helper/symbol'
import { isArray } from '../utils/type'
import { ISerializedPoint } from './interface'

/**
 * 地址位置
 *
 * @author haroldhu
 */
export class Point {
  /**
   * 纬度
   * [-90, 90]
   */
  readonly latitude: number;

  /**
   * 经度
   * [-180, 180]
   */
  readonly longitude: number;

  /**
   * 初始化
   *
   * @param latitude    - 纬度 [-90, 90]
   * @param longitude   - 经度 [-180, 180]
   */
  constructor(longitude: number, latitude: number) {
    Validate.isGeopoint('longitude', longitude)
    Validate.isGeopoint('latitude', latitude)

    this.longitude = longitude
    this.latitude = latitude
  }

  parse(key) {
    return {
      [key]: {
        type: 'Point',
        coordinates: [this.longitude, this.latitude]
      }
    }
  }

  toJSON() {
    return {
      type: 'Point',
      coordinates: [
        this.longitude,
        this.latitude,
      ],
    }
  }

  toReadableString() {
    return `[${this.longitude},${this.latitude}]`
  }

  static validate(point: ISerializedPoint) {
    return point.type === 'Point' &&
      isArray(point.coordinates) &&
      Validate.isGeopoint('longitude', point.coordinates[0]) &&
      Validate.isGeopoint('latitude', point.coordinates[1])
  }

  get _internalType() {
    return SYMBOL_GEO_POINT
  }
}
