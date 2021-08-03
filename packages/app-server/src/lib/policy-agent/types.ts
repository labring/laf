import { Params, Policy } from "less-api"




export type InjectionGetter = (payload: any, params: Params) => Promise<any>

/**
 * used in policy agent
 */
export interface PolicyComposition {
  name: string
  policy: Policy
  injector_func: InjectionGetter
}

/**
 * 访问策略存储数据结构
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

export interface PolicyAgentInterface {
  set(name: string, data: PolicyDataStruct): Promise<void>
  get(name: string): PolicyComposition
  clear(): void
}