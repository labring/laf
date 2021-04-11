import { LessInterface } from "../types"
import { FunctionConsole } from "./console"

export type RequireFuncType = (module: 'crypto' | 'path' | 'querystring' | 'url' | 'lodash' | 'moment') => any

// vm run context (global)
export interface RuntimeContext {
  ctx: FunctionContext,
  module: { exports: Object },
  exports: Object,
  __runtime_promise: any,
  console: FunctionConsole,
  less: LessInterface,
  require: RequireFuncType,
  Buffer: typeof Buffer
}

// ctx passed to function
export interface FunctionContext {
  query?: any,
  body?: any,
  auth?: any,
  requestId: string
}

// param for engine.run()
export interface IncomingContext extends FunctionContext {
  functionName: string,
  requestId: string,
  less?: LessInterface
}

export interface FunctionResult {
  data?: any,
  logs: any[],
  error?: any
}