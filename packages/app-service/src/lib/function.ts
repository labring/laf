
import * as engine from "cloud-function-engine"
import { ObjectId } from "mongodb"


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
}