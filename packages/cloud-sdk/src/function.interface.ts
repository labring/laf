import { IncomingHttpHeaders } from 'http'
import { Request, Response } from 'express'
import WebSocket = require('ws')

export type RequireFuncType = (module: string) => any

/**
 * ctx passed to function
 */
export interface FunctionContext {
  files?: File[]
  headers?: IncomingHttpHeaders
  query?: any
  body?: any
  params?: any
  /**
   * @deprecated use user instead
   */
  auth?: any
  user?: any
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
  id: string
  appid: string
  name: string
  source: CloudFunctionSource
  desc: string
  tags: string[]
  websocket: boolean
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
