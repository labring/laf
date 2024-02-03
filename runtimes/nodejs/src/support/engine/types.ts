import { IncomingHttpHeaders } from 'http'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import WebSocket = require('ws')

export type RequireFuncType = (
  module: string,
  fromModules: string[],
  filename?: string,
) => any

/**
 * vm run context (global)
 */
export interface FunctionModuleGlobalContext {
  module: { exports: object }
  exports: object
  console: any
  __require: RequireFuncType
  Buffer: typeof Buffer
  RegExp: typeof RegExp
  setTimeout: typeof setTimeout
  clearTimeout: typeof clearTimeout
  setInterval: typeof setInterval
  clearInterval: typeof clearInterval
  setImmediate: typeof setImmediate
  clearImmediate: typeof clearImmediate
  Float32Array: typeof Float32Array
  __filename: string
  URL: typeof URL
  process: NodeJS.Process
  global: FunctionModuleGlobalContext
  __from_modules: string[]
  fetch: typeof globalThis.fetch
  ObjectId: typeof ObjectId
}

/**
 * ctx passed to function
 */
export interface FunctionContext {
  files?: File[]
  headers?: IncomingHttpHeaders
  query?: any
  body?: any
  user?: any
  params?: any
  requestId?: string
  method?: string
  socket?: WebSocket
  request?: Request
  response?: Response
  __function_name?: string
  [key: string]: any
}

/**
 * Result object returned by the running function
 */
export interface FunctionResult {
  data?: any
  error?: Error
  time_usage: number
}

export enum FunctionStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * Model CloudFunctionSource
 *
 */
export type CloudFunctionSource = {
  code: string
  compiled: string | null
  uri: string | null
  version: number
  hash: string | null
  lang: string | null
}

/**
 * cloud function data structure
 */
export interface ICloudFunctionData {
  _id?: ObjectId
  id: string
  appid: string
  name: string
  source: CloudFunctionSource
  desc: string
  tags: string[]
  methods: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
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
