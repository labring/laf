import {
  ErrorCode,
  WhereFilterOp,
  WhereFilterOpList,
  OrderByDirection,
  OrderDirectionList,
  FieldType
} from './constant'
import { Util } from './util'

/**
 * 校验模块
 *
 * @author haroldhu
 * @internal
 */
export class Validate {

  /**
   * 检测地址位置的点
   *
   * @param point   - 经纬度
   * @param degree  - 数值
   */
  static isGeopoint(point: 'latitude' | 'longitude', degree: number) {
    if (Util.whichType(degree) !== FieldType.Number) {
      throw new Error('Geo Point must be number type')
    }

    // 位置的绝对值
    const degreeAbs = Math.abs(degree)

    if (point === 'latitude' && degreeAbs > 90) {
      throw new Error('latitude should be a number ranges from -90 to 90')
    } else if (point === 'longitude' && degreeAbs > 180) {
      throw new Error('longitude should be a number ranges from -180 to 180')
    }
    return true
  }

  /**
   * 参数是否为整数
   *
   * @param param - 要验证的参数名
   * @param num   - 要验证的参数值
   */
  static isInteger(param: string, num: number): Boolean {
    if (!Number.isInteger(num)) {
      throw new Error(param + ErrorCode.IntergerError)
    }
    return true
  }

  /**
   * 是否为合法的排序字符
   *
   * @param direction
   */
  static isFieldOrder(direction: OrderByDirection): Boolean {
    if (OrderDirectionList.indexOf(direction) === -1) {
      throw new Error(ErrorCode.DirectionError)
    }
    return true
  }

  /**
   * 是否为合法的字段地址
   *
   * 只能是连续字段名+英文点号
   *
   * @param path
   */
  static isFieldPath(path: string): Boolean {
    if (!/^[a-zA-Z0-9-_\.]/.test(path)) {
      throw new Error()
    }
    return true
  }

  /**
   * 是否为合法操作符
   *
   * @param op
   */
  static isOperator(op: WhereFilterOp): Boolean {
    if (WhereFilterOpList.indexOf(op) === -1) {
      throw new Error(ErrorCode.OpStrError)
    }
    return true
  }

  /**
   * 集合名称是否正确
   *
   * 只能以数字字母开头
   * 可以包含字母数字、减号、下划线
   * 最大长度32位
   *
   * @param name
   */
  static isCollName(name: string): Boolean {
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-_]){1,32}$/.test(name)) {
      throw new Error(ErrorCode.CollNameError)
    }
    return true
  }

  /**
   * DocID 格式是否正确
   *
   * @param docId
   */
  static isDocID(docId: string): Boolean {
    if (!/^([a-fA-F0-9]){24}$/.test(docId)) {
      throw new Error(ErrorCode.DocIDError)
    }
    return true
  }
}
