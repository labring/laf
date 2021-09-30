import { Handler } from '../../processor'
import { HandlerContext } from '../..'
import { SecurityUtil } from '../../utils/security'
import { Constraint } from '../../utils/constraint'

/**
 * 对 query 对象进行验证
 * 1. 如果配置为数组，则代表只允许数组内的字段名做为查询条件，如 ['id', 'status']
 * 2. 如果配置为对象，也只允许使用对象内的字段名做为查询条件，并对每个字段做约束性检查
 * @param config 验证器配置，可为数组或对象
 * @param context 上下文
 * @returns 
 */
export const QueryHandler: Handler = async function (config, context) {
    // 缺省时，直接通过
    if (config === undefined) {
        return null
    }
    const { query } = context.params

    if (!query) return 'query is undefined'
    if (typeof query !== 'object') return 'query must be an object'

    // 数组代表只允许出现的字段
    if (config instanceof Array) {
        return checkWithArray(config, context)
    }

    // 如果是对象，则 key 为字段名，值为字段约束条件
    if (typeof config === 'object') {
        return checkWithObject(config, context)
    }

    return 'config error: config must be an array or object'
}


/**
 * 如果配置规则为数组，则代表限定的 query 字段列表
 * @param fields 允许的字段
 * @param context 上下文
 * @returns 
 */
function checkWithArray(fields: string[], context: HandlerContext): string | null {
    const { query } = context.params
    const input_fields = SecurityUtil.resolveFieldFromQuery(query)

    const error = SecurityUtil.isAllowedFields(input_fields, fields)
    return error
}

/**
 * 如果配置为对象，则对其中每个字段进行约束检查
 * @param object 字段及其约束
 * @param context 上下文
 * @returns 
 */
async function checkWithObject(object: any, context: HandlerContext): Promise<string | null> {
    const { query } = context.params
    const input_fields = SecurityUtil.resolveFieldFromQuery(query)
    const allow_fields = Object.keys(object)

    let error = SecurityUtil.isAllowedFields(input_fields, allow_fields)
    if (error) return error

    const constraint = new Constraint(context, query)
    for (const field of allow_fields) {
        error = await constraint.constraintField(field, object[field])
        if (error) return error
    }
    return null
}