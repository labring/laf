import { Handler } from '../../processor'
import { HandlerContext } from '../..'
import { ActionType } from '../../types'
import { SecurityUtil } from '../../utils/security'
import { Constraint, ConstraintTypes } from '../../utils/constraint'
import { assert } from 'console'


export const DataHandler: Handler = async function (config, context) {
    // 缺省时，直接通过
    if (config === undefined) {
        return null
    }

    const { data, merge, action } = context.params

    if (!data) return 'data is undefined'
    if (typeof data !== 'object') return 'data must be an object'

    if (action === ActionType.ADD) {
        return await dealAddData(config, context)
    }

    if (action === ActionType.UPDATE && merge) {
        return await dealUpdateData(config, context)
    }

    if (action === ActionType.UPDATE && !merge) {
        return await dealAddData(config, context)
    }
}

/**
 * 处理 add data 
 * @param config 
 * @param context 
 * @returns 
 */
async function dealAddData(config: any, context: HandlerContext) {
    const { data } = context.params

    // data in add 不可有操作符
    if (SecurityUtil.hasUpdateOperator(data)) {
        return 'data must not contain any operator'
    }

    const input_fields = Object.keys(data)
    if (!input_fields.length) return 'data is empty'

    // 数组代表只允许出现的字段
    if (config instanceof Array) {
        const allow_fields = config
        const error = SecurityUtil.isAllowedFields(input_fields, allow_fields)
        return error
    }

    // 对象则逐一检查字段约束
    if (typeof config === 'object') {
        const allow_fields = Object.keys(config)
        let error = SecurityUtil.isAllowedFields(input_fields, allow_fields)
        if (error) return error

        const constraint = new Constraint(context, data)
        for (const field of allow_fields) {
            error = await constraint.constraintField(field, config[field])
            if (error) return error
        }
        return null
    }

    return 'config error: config must be an array or object'
}

/**
 * 处理 update data
 * @param config 
 * @param context 
 * @returns 
 */
async function dealUpdateData(config: any, context: HandlerContext) {
    const { data, merge } = context.params
    assert(merge, 'merge should be true when perform updating')

    const flatten = SecurityUtil.flattenData(data)

    const fields = Object.keys(flatten)
    if (!fields.length) return 'data is empty'
    let allow_fields = []

    // 更新时必须有更新操作符，如 $set $push $inc $mul 之类的操作符
    if (!SecurityUtil.hasUpdateOperator(data)) {
        return 'data must contain operator while `merge` with true'
    }

    // 数组代表只允许出现的字段
    if (config instanceof Array) {
        allow_fields = config
        const error = SecurityUtil.isAllowedFields(fields, allow_fields)
        return error
    }

    // 对象则逐一检查字段约束
    if (typeof config === 'object') {
        allow_fields = Object.keys(config)
        let error = SecurityUtil.isAllowedFields(fields, allow_fields)
        if (error) return error

        // 只对 $set 数据做约束检查
        const set_data = data.$set ?? {}

        // 更新时忽略 required 和 default 约束
        const constraint = new Constraint(context, set_data, [ConstraintTypes.REQUIRED, ConstraintTypes.DEFAULT])
        for (const field of allow_fields) {
            error = await constraint.constraintField(field, config[field])
            if (error) return error
        }
        return null
    }

    return 'config error: config must be an array or object'
}
