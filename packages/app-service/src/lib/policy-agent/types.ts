/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-02 14:49:50
 * @LastEditTime: 2021-10-06 19:02:21
 * @Description: 
 */

import { Params, Policy } from "database-proxy"


export type InjectionGetter = (payload: any, params: Params) => Promise<any>

/**
 * Composition of a policy and its injector function,  used in policy agent
 */
export interface PolicyComposition {
  name: string
  policy: Policy
  injector_func: InjectionGetter
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
 * Interface of PolicyAgent
 */
export interface PolicyAgentInterface {
  set(name: string, data: PolicyDataStruct): Promise<void>
  get(name: string): PolicyComposition
  clear(): void
}