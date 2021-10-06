/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-04 00:31:53
 * @LastEditTime: 2021-10-06 21:12:34
 * @Description: 
 */

import assert = require("assert")
import { AccessorInterface, Params, Policy } from "database-proxy"
import { CloudFunction } from "cloud-function-engine"
import { getFunctionByName } from "../../api/function"
import { InjectionGetter, PolicyAgentInterface, PolicyComposition, PolicyDataStruct } from "./types"
import { logger } from "../logger"


/**
 * Policy Agent class
 * - managing multiple policies
 * - initialize injector of policies
 */
export class PolicyAgent implements PolicyAgentInterface {
  private _accessor: AccessorInterface
  private _data: Map<string, PolicyComposition> = new Map()

  constructor(accessor: AccessorInterface) {
    assert(accessor, 'accessor cannot be empty')
    this._accessor = accessor
  }

  async set(name: string, data: PolicyDataStruct) {
    assert(data, 'policy data cannot be empty')

    const policy = new Policy(this._accessor)
    policy.load(data.rules)

    const injector_func = await this.getInjector(data.injector)

    this._data.set(name, { name, policy, injector_func })
  }

  get(name: string) {
    return this._data.get(name)
  }


  clear() {
    this._data.clear()
  }

  private async getInjector(injectorName: string): Promise<InjectionGetter> {
    if (!injectorName) {
      return defaultInjectionGetter
    }

    try {
      const func_data = await getFunctionByName(injectorName)
      assert.ok(func_data, 'getFunctionByName(): function not found')

      const func = new CloudFunction(func_data)
      const ret = await func.invoke({})
      assert(typeof ret.data === 'function', 'function type needed')

      return ret.data

    } catch (error) {
      logger.error(`failed to get injector by cloud function: ${injectorName}, now using default injector`, error)
      return defaultInjectionGetter
    }
  }
}

/**
 * default injection getter
 * @param auth the payload object of a standard JWT token
 * @returns injections for validation in policy
 */
async function defaultInjectionGetter(auth: any, _params: Params) {
  auth = auth || {}
  return {
    ...auth
  }
}