
import { FunctionConsole } from "./console"
import { IncomingHttpHeaders } from "http"
import { Request, Response } from "express"
import { ObjectId } from "mongodb"


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
  __filename: string,
  process: {
    env: { [key: string]: string },
  },
  global: RuntimeContext
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
  request?: Request,
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

export enum FunctionStatus {
  DISABLED = 0,
  ENABLED = 1
}

/**
 * cloud function data structure
 */
export interface ICloudFunctionData {
  _id: ObjectId
  description: string
  tags: string[]
  label: string
  name: string
  triggers: any[]
  version: number
  hash: string
  status: FunctionStatus
  enableHTTP: boolean
  appid: string
  debugParams: string
  code: string
  compiledCode: string
  created_at: Date
  updated_at: Date
  created_by: any
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