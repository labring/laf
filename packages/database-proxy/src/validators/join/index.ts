import { Handler } from '../../processor'
import { ActionType, JoinType } from "../../types"
// import { execScript } from '../utils'
/**
 * 本验证器应该加载为了缺省验证器，即用户未配置 join 时，也会进行缺省验证
 * Join 联表的验证规则，可支持以下两种写法：
 * 1. 配置可以与哪些表关联查询 join ["t1", "t2"]
 * 2. 更详细的配置，指定关联字段，客户端关联字段需要于此一致
 *    如果缺省，则使用配置作为默认字段 join { t1 ["leftid", "rightid"], t2 ["lid", "rid"] }
 * @param config 
 * @param context 
 */

export const JoinHandler: Handler = async function (config, context) {
  const { action } = context.params
  const joins = context.params.joins || []

  // 无联表的查询直接通过
  if (joins.length === 0) {
    return null
  }

  // 只有读操作可联表
  if (action !== ActionType.READ) {
    return 'operation denied: only READ support join query'
  }

  // 缺省验证规则：默认不允许 join 操作
  if (config === undefined) {
    return 'join query denied by default'
  }

  // 当配置为字符串时，拼成数组
  if (typeof config === 'string') {
    config = [config]
  }

  if (!(config instanceof Array)) {
    return 'config must be string or string[]'
  }

  // 配置为数组形式时, like ['x_table', 'y_table']
  // 代表为允许联查的表名
  if (!config.every(it => typeof it === 'string')) {
    return `config must be string or string[]`
  }

  for (const join of joins) {
    if (!config.includes(join.collection)) {
      return `join query with ${join.collection} denied`
    }

    // TODO 需要实现对子表权限的判断？否则 right, full 操作会有安全问题
    // 暂只允许 left join 以防止此问题
    if (join.type != JoinType.LEFT) {
      return `only left join supported by now`
    }
  }

  return null
}