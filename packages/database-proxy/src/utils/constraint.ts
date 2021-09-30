
import { assert } from 'console'
import * as $ from 'validator'
import { HandlerContext } from '../processor'
import { executeScript, parseQueryURI } from './script'

export enum ConstraintTypes {
    REQUIRED = 'required',
    IN = 'in',
    DEFAULT = 'default',
    LENGTH = 'length',
    NUMBER = 'number',
    UNIQUE = 'unique',
    MATCH = 'match',
    EXISTS = 'exists',
    CONDITION = 'condition',
    COND = 'cond',
    NOT_EXISTS = 'notExists'
}

export class Constraint {
    static readonly ALLOWED_CONSTRAINTS = [
        ConstraintTypes.REQUIRED, ConstraintTypes.IN, ConstraintTypes.DEFAULT,
        ConstraintTypes.LENGTH, ConstraintTypes.NUMBER,
        ConstraintTypes.UNIQUE, ConstraintTypes.MATCH, ConstraintTypes.EXISTS,
        ConstraintTypes.CONDITION, ConstraintTypes.COND,
        ConstraintTypes.NOT_EXISTS
    ]

    readonly context: HandlerContext
    data: any

    ignoreConstraints: string[]

    constructor(context: HandlerContext, data: any, ignoreConstraints?: string[]) {
        assert(context, 'context cannot be empty')
        assert(data, 'data to be constrainted cannot be empty')

        this.context = context
        this.data = data
        this.ignoreConstraints = ignoreConstraints ?? []
    }

    /**
     * 验证请求 query 中的一个字段
     * 1. 如果请求 query 中缺省了该字段，除进行 required 和 default 检查外，则不进行额外约束，直接通过
     * 2. 如果请求 query 中存在该字段，则对该字段进行所有约束检查，任意一条检查未通过则返回检查失败
     * @param field 要验证的字段名
     * @param constrains 此字段的约束配置
     * @param context 请求上下文
     * @returns 
     */
    async constraintField(field: string, constrains: any) {
        assert(this.context, 'context cannot be empty')
        assert(this.data, 'data to be constrainted cannot be empty')

        const data = this.data
        if (typeof constrains === 'string') {
            constrains = { condition: constrains }
        }

        if (typeof constrains !== 'object') {
            return `config error: [${field}]'s constraint config must be an object`
        }

        /**
         * 当此字段缺省时，进行 required 和 default 约束检查
         * 1. 如果存在 default 设置，则将缺省字段设置为默认值，跳过 required 以及后续约束检查，直接通过
         * 2. 如果不存在 default，则进行 requied 约束检查，并跳过后续约束检查
         */
        if (!this.ignored('default') && data[field] === undefined) {
            // if default
            if (constrains['default'] !== undefined) {
                data[field] = data[field] = constrains['default']
                return null
            } else if (!this.ignored('required')) {
                const isRequired = constrains['required'] == true
                return isRequired ? `${field} is required` : null
            }
        }

        // 排除掉 required & default 约束
        const constraintNames = (Object.keys(constrains) as ConstraintTypes[])
            .filter(name => [ConstraintTypes.REQUIRED, ConstraintTypes.DEFAULT].includes(name) == false)

        // 对每个约束进行检查
        for (const constraintName of constraintNames) {
            if (this.ignored(constraintName)) {
                continue
            }
            const options = constrains[constraintName]
            const error = await this.checkConstraint(constraintName, options, field)
            if (error) return error
        }

        return null
    }

    /**
     * 对字段进行约束性检查
     * @param constraintName 约束名
     * @param constraintOption 约束配置
     * @param fieldKey query 字段名
     * @param context 请求上下文
     * @returns error or null
     */
    async checkConstraint(constraintName: ConstraintTypes, constraintOption: any, fieldKey: string) {
        assert(this.context, 'context cannot be empty')
        assert(this.data, 'data to be constrainted cannot be empty')

        const data = this.data
        if (!Constraint.ALLOWED_CONSTRAINTS.includes(constraintName)) {
            return `config error: unknown rule [${constraintName}]`
        }

        const value = data[fieldKey]
        const option = constraintOption

        if (constraintName === ConstraintTypes.CONDITION) {
            return await this.performCondition(option, fieldKey, value)
        }

        if (constraintName === ConstraintTypes.COND) {
            return await this.performCondition(option, fieldKey, value)
        }

        if (constraintName === ConstraintTypes.IN) {
            return this.performIn(option, fieldKey, value)
        }

        if (constraintName === ConstraintTypes.LENGTH) {
            return this.performLength(option, fieldKey, value)
        }

        if (constraintName === ConstraintTypes.NUMBER) {
            return this.performNumber(option, fieldKey, value)
        }

        if (constraintName === ConstraintTypes.MATCH) {
            return this.performMatch(option, fieldKey, value)
        }

        // {"exists": "/users/id"},
        if (constraintName === ConstraintTypes.EXISTS) {
            return await this.performExists(option, fieldKey, value)
        }

        // {"notExists": "/users/id"},
        if (constraintName === ConstraintTypes.NOT_EXISTS) {
            return await this.performNotExists(option, fieldKey, value)
        }

        if (constraintName === ConstraintTypes.UNIQUE && constraintOption) {
            return await this.performUnique(option, fieldKey, value)
        }

        return null
    }


    /**
     * 约束未被忽略
     * @param constraintName 约束名
     * @returns 
     */
    private ignored(constraintName: string): boolean {
        return this.ignoreConstraints.includes(constraintName)
    }

    private async performCondition(constraintOption: string, fieldKey: string, value: any) {
        const { injections } = this.context

        const global = { ...injections, $value: value, $v: value }
        const { result, error } = await executeScript(constraintOption, global, this.context, fieldKey)
        if (error) return error

        // 如果 result 为真，则通过验证
        if (result) return null

        return `condition evaluted to false`
    }

    private performIn(constraintOption: any[], fieldKey: string, value: any) {
        if (!(constraintOption instanceof Array)) {
            return `config error: ${fieldKey}#in must be an array`
        }

        if (!constraintOption.includes(value)) {
            const str = constraintOption.join(',')
            return `${fieldKey} should equal to one of [${str}]`
        }
    }

    private performLength(constraintOption: number[], fieldKey: string, value: any) {
        if (!(constraintOption instanceof Array && constraintOption.length)) {
            return `config error: ${fieldKey}#length must be an array with 1-2 integer element, ex. [3, 10]`
        }

        const min = constraintOption[0]
        const max = constraintOption.length >= 2 ? constraintOption[1] : undefined
        const ok = $.isLength(value, min, max)
        if (!ok) {
            let error = `length of ${fieldKey} should >= ${min}`
            if (max !== undefined) error += ` and <= ${max}`
            return error
        }
    }

    private performNumber(constraintOption: number[], fieldKey: string, value: any) {
        if (!(constraintOption instanceof Array && constraintOption.length)) {
            return `config error: ${fieldKey}#number must be an array with 1-2 integer element, ex. [3, 10]`
        }

        const min = constraintOption[0]
        const max = constraintOption.length >= 2 ? constraintOption[1] : Infinity

        const ok = value >= min && value <= max
        if (!ok) {
            let error = `${fieldKey} should >= ${min}`
            if (max !== Infinity) error += ` and <= ${max}`
            return error
        }
    }

    private performMatch(constraintOption: string, fieldKey: string, value: any) {
        if (!(typeof constraintOption === 'string' && constraintOption.length)) {
            return `config error: ${fieldKey}#match must be a string`
        }

        try {
            const partten = new RegExp(constraintOption)
            const ok = partten.test(value)
            if (!ok) {
                return `${fieldKey} had invalid format`
            }
        } catch (error) {
            return error
        }
    }

    private async performExists(constraintOption: string, fieldKey: string, value: any) {
        if (!(typeof constraintOption === 'string' && constraintOption.length)) {
            return `config error: ${fieldKey}#exists must be a string`
        }

        const { collection, field } = parseQueryURI(constraintOption)
        const accessor = this.context.ruler.accessor

        const ret = await accessor.get(collection, { [field]: value })
        if (!ret) return `${fieldKey} not exists in ${collection}`
    }

    private async performNotExists(constraintOption: string, fieldKey: string, value: any) {
        if (!(typeof constraintOption === 'string' && constraintOption.length)) {
            return `config error: ${fieldKey}#notExists must be a string`
        }

        const { collection, field } = parseQueryURI(constraintOption)
        const accessor = this.context.ruler.accessor

        const ret = await accessor.get(collection, { [field]: value })
        if (ret) return `${fieldKey} already exists in ${collection}`
    }

    private async performUnique(_constraintOption: string, fieldKey: string, value: any) {
        const accessor = this.context.ruler.accessor
        const collection = this.context.params.collection
        const ret = await accessor.get(collection, { [fieldKey]: value })
        if (ret) return `${fieldKey} already exists`
    }
}