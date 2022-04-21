/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:58:33
 * @Description: 
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../db"
import { ObjectId } from 'mongodb'
import * as engine from "cloud-function-engine"


export enum FunctionStatus {
  DISABLED = 0,
  ENABLED = 1
}

/**
 * Extended function struct
 */
export interface CloudFunctionStruct extends engine.CloudFunctionStruct {
  _id: ObjectId
  description: string
  tags: string[]
  label: string
  triggers: any[]
  version: number
  hash: string
  status: FunctionStatus
  enableHTTP: boolean
  appid: string
  debugParams: string
  created_at: number
  updated_at: number
  created_by: any
}

/**
  * Custom require function in cloud function
  * 
  * @see CloudFunction.require_func
  * @param module the module id. ex. `path`, `lodash`
  * @returns 
  */
engine.CloudFunction.require_func = (module: string): any => {
  if (module === '@/cloud-sdk') {
    return require('../cloud-sdk')
  }

  return require(module) as any
}

export class CloudFunction extends engine.CloudFunction {

  /**
  * Function data
  */
  protected _data: CloudFunctionStruct

  get id() {
    return this._data._id
  }

  /**
   * Http enabled status
   */
  get enableHTTP() {
    return this._data.enableHTTP
  }

  /**
   * Function status which control if the function could be invoked or not
   */
  get status() {
    return this._data.status
  }

  /**
   * Gets the cloud function by function name
   * @param func_name 
   * @returns 
   */
  static async getFunctionByName(func_name: string) {
    const db = DatabaseAgent.db

    const doc = await db.collection<CloudFunctionStruct>(Constants.function_collection)
      .findOne({ name: func_name })

    return doc
  }

  /**
    * Get the cloud function by function id
    * @param func_id 
    * @returns 
    */
  static async getFunctionById(func_id: string) {
    const db = DatabaseAgent.db

    const doc = await db.collection<CloudFunctionStruct>(Constants.function_collection)
      .findOne({
        _id: new ObjectId(func_id)
      })

    return doc
  }
}

export interface CloudFunctionLogStruct {
  requestId: string
  method: string
  func_id: ObjectId
  func_name: string
  logs: string[]
  time_usage: number
  data: any
  error: Error
  debug?: boolean
  created_at?: Date
  created_by?: any
}

/**
 * Add function execution log
 * @param data 
 * @returns 
 */
export async function addFunctionLog(data: CloudFunctionLogStruct): Promise<any> {
  const db = DatabaseAgent.db

  if (!data) return null
  if (typeof data.error === 'object') {
    data.error = data.error.toString() as any
  }

  const r = await db.collection(Constants.function_log_collection)
    .insertOne({
      ...data,
      created_at: new Date()
    })

  return r.insertedId
}