
import { FunctionConsole } from "./console"
import { AxiosStatic } from 'axios'
import { Db } from 'less-api-database'
import { FileStorageInterface } from "../storage/interface"
import { IncomingHttpHeaders } from "node:http"

export type RequireFuncType = (module: string) => any
export type InvokeFunctionType = (name: string, param: FunctionContext) => Promise<any>
export type EmitFunctionType = (event: string, param: any) => void
export type GetTokenFunctionType = (payload: any) => string
export type ParseTokenFunctionType = (token: string) => any | null

export interface CloudSdkInterface {
  fetch: AxiosStatic
  storage(namespace: string): FileStorageInterface
  database(): Db,
  invoke: InvokeFunctionType
  emit: EmitFunctionType
  shared: Map<string, any>
  getToken: GetTokenFunctionType
  parseToken: ParseTokenFunctionType
}

// vm run context (global)
export interface RuntimeContext {
  __context__: FunctionContext,
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
  files?: File[]
  headers?: IncomingHttpHeaders
  query?: any,
  body?: any,
  params?: any,
  auth?: any,
  requestId?: string,
  method?: string
}

// param for engine.run()
export interface IncomingContext {
  context: FunctionContext
  functionName: string
  less: CloudSdkInterface
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