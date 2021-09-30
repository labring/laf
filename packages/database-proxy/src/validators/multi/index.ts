import { Handler } from '../../processor'
import { ActionType } from "../../types"
import { executeScript } from '../../utils/script'

/**
 * 是否允许用户操作多条数据
 * 1. 读操作默认允许查询多条
 * 2. 写操作默认不允许多条操作
 * @param config 
 * @param context 
 */
export const MultiHandler: Handler = async function (config, context) {

    const { query, multi, data, action } = context.params

    let allow_multi = false

    // 读操作默认开启 multi
    if (action === ActionType.READ) {
        allow_multi = true
    }

    // 布尔值配置方式
    if ([true, false].includes(config)) {
        allow_multi = config
    }

    // 字符串代表表达式
    if (typeof config === 'string') {
        const { injections } = context
        const global = {
            ...injections,
            query,
            data,
            multi
        }
        const { result } = await executeScript(config, global, context)
        allow_multi = result ? true : false
    }


    if (action === ActionType.ADD) {
        // 要插入的数据是数组，但传入的 multi 却是假值
        if ((data instanceof Array) && !multi) {
            return 'multi insert operation denied'
        }
    }


    // 规则允许，则直接通过
    if (allow_multi) {
        return null
    }


    // 规则不允许 multi 且不匹配则拒绝
    if (!allow_multi && multi) {
        return 'multi operation denied'
    }


    return null
}