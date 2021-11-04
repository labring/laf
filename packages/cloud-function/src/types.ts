
import { FunctionConsole } from "./console"
import { IncomingHttpHeaders } from "http"
import { Response } from "express"


export type RequireFuncType = (module: string) => any


/**
 * vm run context (global)
 */
export interface RuntimeContext {
  __context__: FunctionContext,
  module: { exports: Object },
  exports: Object,
  console: FunctionConsole,
  require: RequireFuncType,
  Buffer: typeof Buffer,
  setTimeout: typeof setTimeout,
  clearTimeout: typeof clearTimeout,
  setInterval: typeof setInterval,
  clearInterval: typeof clearInterval,
  setImmediate: typeof setImmediate,
  clearImmediate: typeof clearImmediate
  __filename: string
}

/**
 * ctx passed to function
 */
export interface FunctionContext {
  files?: File[]
  headers?: IncomingHttpHeaders
  query?: any,
  body?: any,
  params?: any,
  auth?: any,
  requestId?: string,
  method?: string,
  response?: Response,
  __function_name?: string
}

/**
 * 运行函数返回的结果对象
 */
export interface FunctionResult {
  data?: any,
  logs: any[],
  error?: Error,
  time_usage: number
}

/**
 * 云函数的存储结构
 */
export interface CloudFunctionStruct {
  _id: string,
  name: string,
  /**
   * 云函数源代码，通常是 ts
   */
  code: string,
  /**
   * 云函数编译后的代码，通常是 js
   */
  compiledCode: string
  enableHTTP: boolean,
  status: number,
  created_by: number,
  created_at: number
  updated_at: number
}

/** Object containing file metadata and access information. */
interface File {
  /** Name of the form field associated with this file. */
  fieldname: string
  /** Name of the file on the uploader's computer. */
  originalname: string
  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string
  /** Value of the `Content-Type` header for this file. */
  mimetype: string
  /** Size of the file in bytes. */
  size: number
  /** `DiskStorage` only: Directory to which this file has been uploaded. */
  destination: string
  /** `DiskStorage` only: Name of this file within `destination`. */
  filename: string
  /** `DiskStorage` only: Full path to the uploaded file. */
  path: string
}