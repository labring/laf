/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-02 14:49:50
 * @LastEditTime: 2021-08-18 15:45:28
 * @Description: 
 */

import { Params, Policy } from "less-api"


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