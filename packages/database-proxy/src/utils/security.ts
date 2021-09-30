import { LOGIC_COMMANDS, QUERY_COMMANDS, UPDATE_COMMANDS } from "../types"



/**
 * 安全工具
 */
export class SecurityUtil {

  // 检查字段名是否合法：data field, query field
  static checkField(name: string): boolean {
    if (this.isQueryOrLogicOperator(name)) {
      return true
    }

    const black_list = [
      ' ',
      '#',
      // ' or ',
      ';',
      `'`,
      `"`,
      '`',
      '-',
      '/',
      '*',
      '\\',
      '+',
      '%'
    ]
    if (this.containChars(name, black_list)) {
      return false
    }

    return true
  }

  // 检查字段名是否合法：data field, query field
  static checkProjection(name: string): boolean {
    const black_list = [
      '#',
      ' or ',
      ';',
      `'`,
      `"`,
      '`',
      '+',
      '-',
      '/',
      '\\',
      '%',
    ]
    if (this.containChars(name, black_list)) {
      return false
    }

    return true
  }

  /**
   * 递归收集 query 中的字段列表，去除操作符（逻辑、查询操作符）
   * @param query 请求 query 对象
   * @returns 
   */
  static resolveFieldFromQuery(query: Object): string[] {
    const sets = []
    for (const key in query) {
      if (this.isQueryOrLogicOperator(key)) {
        const ret = this.resolveFieldFromQuery(query[key])
        sets.push(...ret)
      } else {
        sets.push(key)
      }
    }

    return sets
  }

  /**
   * 递归收集 data 中的字段列表，去除更新操作符
   * @param data 
   */
  static resolveFieldFromData(data: Object): string[] {
    const sets = []
    for (const key in data) {
      if (this.isUpdateOperator(key)) {
        const ret = this.resolveFieldFromData(data[key])
        sets.push(...ret)
      } else {
        sets.push(key)
      }
    }

    return sets
  }

  /**
   * 判断字段列是否都在白名单内
   * @param input_fields [string] 输入字段列表
   * @param allow_fields [string] 允许的字段列表
   */
  static isAllowedFields(input_fields: string[], allow_fields: string[]): string | null {
    for (let fd of input_fields) {
      if (!allow_fields.includes(fd))
        return `the field '${fd}' is NOT allowed]`
    }
    return null
  }

  /**
   * 检查给定字符串中是否包含指定字符
   * @param source 字符串
   * @param str_list 字符白名单或黑名单
   * @returns 
   */
  static containChars(source: string, str_list: string[]): boolean {
    for (const ch of str_list) {
      if (source.indexOf(ch) >= 0)
        return true
    }

    return false
  }

  // 是否为逻辑操作符
  static isLogicOperator(key: string): boolean {
    const keys = Object.keys(LOGIC_COMMANDS)
      .map(k => LOGIC_COMMANDS[k])
    return keys.includes(key)
  }

  // 是否为查询操作符(QUERY_COMMANDS)
  static isQueryOperator(key: string): boolean {
    const keys = Object.keys(QUERY_COMMANDS)
      .map(k => QUERY_COMMANDS[k])
    return keys.includes(key)
  }

  // 是否为查询或逻辑操作符
  static isQueryOrLogicOperator(key: string): boolean {
    return this.isLogicOperator(key) || this.isQueryOperator(key)
  }

  // 是否存在更新操作符
  static hasUpdateOperator(data: any): boolean {
    const OPTRS = Object.values(UPDATE_COMMANDS)

    let has = false
    const checkMixed = objs => {
      if (typeof objs !== 'object') return

      for (let key in objs) {
        if (OPTRS.includes(key)) {
          has = true
        } else if (typeof objs[key] === 'object') {
          checkMixed(objs[key])
        }
      }
    }
    checkMixed(data)

    return has
  }

  // 是否为更新操作符
  static isUpdateOperator(key: string): boolean {
    const keys = Object.keys(UPDATE_COMMANDS)
      .map(k => UPDATE_COMMANDS[k])
    return keys.includes(key)
  }


  /**
   * 将带操作符的 data 对象平铺
   * 
  data: {
      title: '',
      $set: {
          content: '',
          author: 123
      },
      $inc: {
          age: 1
      },
      $push: {
          grades: 99,
      },
  }
  */
  static flattenData(data: any = {}): object {
    const result = {}

    for (const key in data) {
      if (!this.isUpdateOperator(key)) {
        result[key] = data[key]
        continue
      }

      const obj = data[key]
      for (const k in obj) {
        result[k] = obj[k]
      }
    }
    return result
  }
}