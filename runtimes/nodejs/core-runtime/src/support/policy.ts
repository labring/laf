/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-04 00:31:53
 * @LastEditTime: 2021-11-05 13:52:52
 * @Description:
 */

import assert = require('assert')
import { Params, Policy } from 'database-proxy'
import { logger } from './logger'
import { CloudFunction } from './function-engine'
import { DatabaseAgent } from '../db'
import { generateUUID } from './utils'
import { POLICY_COLLECTION } from '../constants'

export type InjectionGetter = (payload: any, params: Params) => Promise<any>

/**
 * Composition of a policy and its injector function,  used in policy agent
 */
export interface PolicyComposition {
  name: string
  policy: Policy
  injector_func: InjectionGetter
  cached_at?: number
}

/**
 * The data structure of the policy
 */
export interface PolicyDataStruct {
  _id: string
  name: string
  rules: any[]
  injector: string
  status: number
  created_at: number
  updated_at: number
}

/**
 * Policy Agent class
 * - managing multiple policies
 * - initialize injector of policies
 */
export class PolicyAgent {
  private static _data: Map<string, PolicyComposition> = new Map()

  public static async set(name: string, data: PolicyDataStruct) {
    assert(data, 'policy data cannot be empty')

    const policy = new Policy(DatabaseAgent.accessor)
    policy.load(data.rules)

    const injector_func = await this.getInjector(data.injector)

    const ret = { name, policy, injector_func, cached_at: Date.now() }
    this._data.set(name, ret)
    return ret
  }

  public static async get(name: string) {
    // get from cache
    const cached = this._data.get(name)

    // TODO: consider a better cache policy ?
    if (cached && Date.now() - cached.cached_at < 1000 * 5) {
      return cached
    }

    // clear the stale cache
    if (cached) {
      this._data.delete(name)
    }

    // load from database
    const data = await this.loadPolicy(name)
    if (!data) {
      return null
    }

    // cache & return
    return this.set(name, data)
  }

  public static clear() {
    this._data.clear()
  }

  private static async getInjector(
    injectorName: string,
  ): Promise<InjectionGetter> {
    if (!injectorName) {
      return defaultInjectionGetter
    }

    try {
      const func_data = CloudFunction.getFunctionByName(injectorName)
      assert.ok(func_data, 'getFunctionByName(): function not found')

      const func = new CloudFunction(func_data)
      const ret = await func.invoke({
        __function_name: func.name,
        requestId: generateUUID(),
      })
      assert(typeof ret.data === 'function', 'function type needed')

      return ret.data
    } catch (error) {
      logger.error(
        `failed to get injector by cloud function: ${injectorName}, now using default injector`,
        error,
      )
      return defaultInjectionGetter
    }
  }

  /**
   * Get all access policies
   */
  public static async loadPolicies() {
    const db = DatabaseAgent.db
    const docs = await db
      .collection(POLICY_COLLECTION)
      .find<PolicyDataStruct>({})
      .toArray()

    return docs
  }

  /**
   * Get a policy by name
   * @param name
   * @returns
   */
  public static async loadPolicy(name: string) {
    const db = DatabaseAgent.db
    const doc = await db
      .collection(POLICY_COLLECTION)
      .findOne<PolicyDataStruct>({ name })

    return doc
  }

  /**
   * Applying access policies
   */
  public static async applyPolicies() {
    const policies = await this.loadPolicies()
    this.clear()
    for (const policy of policies) {
      await this.set(policy.name, policy)
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
    ...auth,
  }
}
