import { Handler } from '../../processor'
import { ActionType } from "../../types"

/**
 * 此验证器是缺省验证器，不可配置：
 * - 检查 aggregate 操作中是否包含 $lookup，并禁止客户端进行 $lookup 操作
 * 
 * @TODO 未来可考虑支持 $lookup 的子查询权限验证，相对复杂，暂不考虑
 * 
 * @param config 
 * @param context 
 */

export const LookupHandler: Handler = async function (_config, context) {
  const { action } = context.params
  if (action !== ActionType.AGGREGATE) {
    return null
  }

  const stages = context.params?.stages || []
  const [foundLookup] = stages.filter(item => item.stageKey === '$lookup')

  if (foundLookup) {
    return '$lookup operation is forbidden for client'
  }

  return null
}