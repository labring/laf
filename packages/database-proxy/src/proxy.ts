import { AccessorInterface } from './accessor/accessor'
import { Params, ActionType, getAction } from "./types"
import assert = require('assert')
import { DefaultLogger, LoggerInterface } from './logger'
import { PolicyInterface } from './policy'

export class Proxy {

  private _accessor: AccessorInterface
  private _policy: PolicyInterface
  private _logger: LoggerInterface

  constructor(accessor: AccessorInterface, policy: PolicyInterface) {
    if (policy) {
      this._policy = policy
    }

    if (accessor) {
      this._accessor = accessor
    }
  }

  get logger(): LoggerInterface {
    if (!this._logger) {
      this._logger = new DefaultLogger()
    }
    return this._logger
  }

  setLogger(logger: LoggerInterface) {
    this._logger = logger
  }

  get accessor(): AccessorInterface {
    assert(this._accessor, 'proxy: accessor is empty')
    return this._accessor
  }

  /**
   * @deprecated
   * @param accessor 
   */
  async setAccessor(accessor: AccessorInterface) {
    this.logger.info(`change proxy's accessor: ` + accessor.type)
    this._accessor = accessor
  }

  get policy(): PolicyInterface {
    return this._policy
  }

  /**
   * set policy
   * @deprecated
   * @param ruler 
   */
  async setPolicy(policy: PolicyInterface) {
    this.logger.info(`change proxy's policy`)
    this._policy = policy
  }

  /**
   * perform data request
   * @param params 
   * @returns 
   */
  async execute(params: Params) {
    this.logger.info(`entry before executing`)
    assert(this._accessor, 'accessor not configured for Proxy')
    return await this.accessor.execute(params)
  }

  /**
   * perform validation on request
   * @param params 
   * @param injections 
   * @returns 
   */
  async validate(params: Params, injections: object) {
    this.logger.info(`entry validating`)
    return await this.policy.validate(params, injections)
  }

  /**
   * Parse request params
   * @param reqParams req.body
   * @returns 
   */
  parseParams(reqParams: any): Params {
    const { action } = reqParams
    this.logger.info(`params parsing`)
    const result = Proxy.parse(action, reqParams)
    this.logger.debug(`params parsed: `, JSON.stringify(result))
    return result
  }

  /**
   * Parse request params
   * @param actionType 
   * @param reqParams 
   * @returns 
   */
  static parse(actionType: ActionType, reqParams: any): Params {
    const { collectionName: collection } = reqParams

    let params: Params = { action: actionType, collection }
    let action = getAction(actionType)
    if (!action) {
      throw new Error(`unknown action: ${actionType}`)
    }

    // copy the params
    action.fields.forEach(field => {
      if (reqParams[field]) params[field] = reqParams[field]
    })

    return params
  }
}