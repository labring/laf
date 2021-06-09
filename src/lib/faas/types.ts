
import { FunctionConsole } from "./console"
import { AxiosStatic } from 'axios'
import { Db } from 'less-api-database'
import { FileStorageInterface } from "../storage/interface"


export type RequireFuncType = (module: 'crypto' | 'path' | 'querystring' | 'url' | 'lodash' | 'moment') => any

export type InvokeFunctionType = (name: string, param: FunctionContext) => Promise<any>
export type EmitFunctionType = (event: string, param: any) => void
export interface CloudSdkInterface {
  fetch: AxiosStatic
  storage(namespace: string): FileStorageInterface
  database(): Db,
  invoke: InvokeFunctionType
  emit: EmitFunctionType
}

// vm run context (global)
export interface RuntimeContext {
  ctx: FunctionContext,
  module: { exports: Object },
  exports: Object,
  __runtime_promise: any,
  console: FunctionConsole,
  less: CloudSdkInterface,
  require: RequireFuncType,
  Buffer: typeof Buffer
}

// ctx passed to function
export interface FunctionContext {
  query?: any,
  body?: any,
  auth?: any,
  requestId?: string,
  extra?: any,
  method?: string
}

// param for engine.run()
export interface IncomingContext extends FunctionContext {
  functionName: string,
  requestId: string,
  less?: CloudSdkInterface
}

/**
 * 运行函数返回的结果对象
 */
export interface FunctionResult {
  data?: any,
  logs: any[],
  error?: any,
  time_usage: number
}

/**
 * 云函数的存储结构
 */
export interface CloudFunctionStruct {
  _id: string,
  name: string,
  code: string,
  time_usage: number,
  created_by: number,
  created_at: number
  updated_at: number
}