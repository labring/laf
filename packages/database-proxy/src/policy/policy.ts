
import * as assert from 'assert'
import { Params, getAction, ActionType } from '../types'
import { Handler, Processor, HandlerContext } from '../processor'
import * as BUILT_IN_VALIDATORS from '../validators'
import { AccessorInterface } from '../accessor'
import { DefaultLogger, LoggerInterface } from '../logger'
import { PermissionRule, PolicyInterface, ValidateError, ValidateResult } from './interface'

/**
 * 访问规则结构： 
 * DatabaseRule:
 *   -> CollectionRule:
 *       ->  read: PermissionRule[]
 *       ->  add:  PermissionRule[]
 *       ->  update: PermissionRule[]
 *       ->  remove: PermissionRule[]
 *       ->  count:  PermissionRule[]
 *       ->  watch:  PermissionRule[]
 */


export enum PermissionTypeV1 {
  READ = '.read',
  UPDATE = '.update',
  ADD = '.add',
  REMOVE = '.remove',
  COUNT = '.count'
}

export enum PermissionType {
  READ = 'read',
  UPDATE = 'update',
  ADD = 'add',
  REMOVE = 'remove',
  COUNT = 'count',
  WATCH = 'watch',
  AGGREGATE = 'aggregate'
}

// 数据库规则
export interface DatabaseRule {
  [collection: string]: CollectionRule
}

// 集合规则
export type CollectionRule = {
  // 集合数据的结构约束
  $schema: PermissionRule[],
  read: PermissionRule[],
  add: PermissionRule[],
  update: PermissionRule[],
  remove: PermissionRule[],
  count: PermissionRule[],
  watch: PermissionRule[]
}

// 验证器容器
export interface ValidatorMap {
  [name: string]: Handler
}

export class Policy implements PolicyInterface {

  readonly version = 2
  protected _accessor: AccessorInterface
  protected _logger: LoggerInterface

  /**
   * 验证器注册表
   */
  protected validators: ValidatorMap

  /**
   * 解析后的数据库规则树
   */
  protected rules: DatabaseRule

  private get logger() {
    if (!this._logger) {
      this._logger = new DefaultLogger(0)
    }
    return this._logger
  }

  public setLogger(logger: LoggerInterface) {
    this._logger = logger
  }

  get accessor(): AccessorInterface {
    return this._accessor
  }

  public setAccessor(accessor: AccessorInterface) {
    this._accessor = accessor
  }

  get collections() {
    if (!this.rules) return []
    return Object.keys(this.rules)
  }

  constructor(accessor?: AccessorInterface) {
    this._accessor = accessor
    this.validators = {}
    this.rules = {}
    this.loadBuiltins()
  }

  /**
   * 加载 rules in json
   * @param rules any
   * @returns 
   */
  load(rules: any) {
    this.logger.debug(`load rules: `, JSON.stringify(rules))
    assert.equal(typeof rules, 'object', "invalid 'rules'")

    // 处理每张数据库表的访问规则
    for (let collection in rules) {
      this.add(collection, rules[collection])
    }

    this.logger.info(`all rules loaded`)
    return true
  }

  /**
   * 添加一个集合的访问规则，同 {set()}，但当集合已存在时，则添加失败
   * @param collection 集合名称
   * @param rules 集合的访问规则，是一个对象， like { "read": {...}, 'update': {...} }
   */
  add(collection: string, rules: any) {
    if (this.collections.includes(collection)) {
      throw new Error(`add collection rules failed: ${collection} already exists`)
    }

    this.set(collection, rules)
  }

  /**
   * 设置一个集合的访问规则，若集合规则已存在，则替换其规则
   * @param collection 集合名称
   * @param rules 集合的访问规则，是一个对象， like { "read": {...}, 'update': {...} }
   */
  set(collection: string, rules: any) {
    this.logger.info(`set collection rules: ${collection}...`)

    rules = this.convertPermissionConfig(rules)

    // 集合权限，是一个对象， like { "read": {...}, 'update': {...} }
    const collectionRule = {} as CollectionRule

    // 处理每种权限规则, like ['read', 'update' ...]
    const perm_types = Object.keys(rules) as PermissionType[]
    for (const ptype of perm_types) {
      // skip non-permisstion-type item, like '$schema'
      if (ptype as string === '$schema') {
        continue
      }

      // 权限对应的验证器配置, like { 'condition': true, 'data': {...} }
      const permissionConfig = rules[ptype]
      const permissionConfigArr = this.wrapRawPermissionRuleToArray(permissionConfig)

      // add schema config if ADD or UPDATE
      if ([PermissionType.ADD, PermissionType.UPDATE].includes(ptype)) {
        permissionConfigArr.forEach(pmc => {
          pmc['schema'] = rules['$schema']
        })
      }

      // instantiate validators
      collectionRule[ptype] = this.instantiateValidators(permissionConfigArr)
    }

    this.rules[collection] = collectionRule
  }

  /**
   * 转换 v1 版本的权限名到 v2
   * example:
   * ".read" -> "read"
   * ".update" -> ".update"
   * ...
   * @param rules 
   * @returns 
   */
  private convertPermissionConfig(rules: any): any {
    let newRules = {}
    for (const key in rules) {
      let type = key
      switch (key) {
        case PermissionTypeV1.READ:
          type = PermissionType.READ
          break
        case PermissionTypeV1.UPDATE:
          type = PermissionType.UPDATE
          break
        case PermissionTypeV1.ADD:
          type = PermissionType.ADD
          break
        case PermissionTypeV1.COUNT:
          type = PermissionType.COUNT
          break
        case PermissionTypeV1.REMOVE:
          type = PermissionType.REMOVE
          break
      }
      newRules[type] = rules[key]
    }
    return newRules
  }

  /**
   * normalize：将输入规则格式转为内部统一形式，即对象数组
   * 1. boolean -> [{ condition: "bool string"}] 
   * 2. string -> [{ condition: "expression string" }]
   * 3. object -> [ object ]
   * 4. array -> array
   * @param permissionRules 
   * @returns 
   */
  private wrapRawPermissionRuleToArray(permissionRules: any): any[] {
    assert.notEqual(permissionRules, undefined, 'permissionRules is undefined')

    let rules = permissionRules

    // 权限规则为布尔时，默认使用 condition 验证器
    if ([true, false].includes(rules)) {
      rules = [{ condition: `${rules}` }]
    }

    // 权限规则为字符串时，默认使用 condition 验证器
    if (typeof rules === 'string') rules = [{ condition: rules }]

    // 权限规则不为数组时，转为数组
    if (!(rules instanceof Array)) rules = [rules]
    return rules
  }

  /**
   * 实例化验证器
   * @param permissionRules 权限规则
   */
  private instantiateValidators(rules: any[]): PermissionRule[] {
    const result: PermissionRule[] = rules.map(raw_rule => {
      const prule: PermissionRule = {}

      // 检查用户配置的验证器是否已注册
      for (let vname in raw_rule) {
        const handler = this.validators[vname]
        if (!handler) {
          throw new Error(`unknown validator '${vname}' in your rules`)
        }
      }

      // 逐一实例化验证器
      for (let vname in this.validators) {
        const handler = this.validators[vname]

        // 如果用户并未配置此验证器，则其配置缺省为 undefined，验证器实现时需处理缺省情况
        const config = raw_rule[vname]
        prule[vname] = new Processor(vname, handler, config)
      }
      return prule
    })

    return result
  }

  /**
   * 验证访问规则
   * @param params 
   * @param injections 
   */
  async validate(params: Params, injections: object): Promise<ValidateResult> {
    const { collection, action: actionType } = params
    this.logger.debug(`ruler validate with injections: `, injections)

    let errors: ValidateError[] = []

    // 判断所访问的集合是否配置规则
    if (!this.collections.includes(collection)) {
      this.logger.debug(`validate() ${collection} not in rules`)
      const err: ValidateError = { type: 0, error: `collection "${collection}" not found` }
      errors.push(err)
      return { errors }
    }

    // action 是否合法
    const action = getAction(actionType)
    if (!action) {
      const err: ValidateError = { type: 0, error: `action "${actionType}" invalid` }
      errors.push(err)
      return { errors }
    }

    const permName = this.getPermissionName(action.type)
    const permRules: PermissionRule[] = this.rules[collection][permName]

    // if no permission rules
    if (!permRules) {
      const err: ValidateError = { type: 0, error: `${collection} ${actionType} don't has any rules` }
      errors.push(err)
      return { errors }
    }

    this.logger.trace(`${actionType} -> ${collection} permission rules: `, permRules)

    // loop for validating every permission rule
    let matched = null
    const context: HandlerContext = { ruler: this, params, injections }

    for (let validtrs of permRules) {
      let error: ValidateError = null
      // 执行一条规则的所有验证器
      for (let vname in validtrs) {
        let result = await validtrs[vname].run(context)
        // 任一验证器执行不通过，则跳过本条规则
        if (result) {
          error = { type: vname, error: result }
          break
        }
      }

      if (error) errors.push(error)

      // 本条规则验证通过
      if (!error) {
        matched = validtrs
        break
      }
    }

    // return error if no permission rule matched
    if (!matched) {
      this.logger.debug(`validate rejected: ${actionType} -> ${collection} `)
      this.logger.trace(`validate errors: `, errors)
      return { errors }
    }

    this.logger.debug(`validate passed: ${actionType} -> ${collection} `)
    this.logger.trace(`matched: `, matched)

    return { matched }
  }


  /**
   * 注册验证器
   * @param name 
   * @param handler 
   */
  register(name: string, handler: Handler) {
    assert.ok(name, `register error: name must not be empty`)
    assert.ok(handler instanceof Function, `${name} register error: 'handler' must be a callable function`)

    const exists = Object.keys(this.validators).filter(vn => vn === name)
    assert.ok(!exists.length, `validator's name: '${name}' duplicated`)

    this.validators[name] = handler
  }

  /**
   * 加载内置验证器
   */
  private loadBuiltins() {
    for (let name in BUILT_IN_VALIDATORS) {
      const handler = BUILT_IN_VALIDATORS[name] as Handler
      this.register(name, handler)
    }
  }

  /**
   * 获取指定 ActionType 对应的权限名
   * @param action ActionType
   * @returns 
   */
  private getPermissionName(action: ActionType): PermissionType {
    switch (action) {
      case ActionType.ADD:
        return PermissionType.ADD
      case ActionType.READ:
        return PermissionType.READ
      case ActionType.AGGREGATE:
        return PermissionType.AGGREGATE
      case ActionType.UPDATE:
        return PermissionType.UPDATE
      case ActionType.REMOVE:
        return PermissionType.REMOVE
      case ActionType.COUNT:
        return PermissionType.COUNT

      default:
        throw new Error('getPermissionName() unknown action')
    }
  }
}