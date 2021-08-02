import { AxiosStatic } from "axios"
import { Db } from "less-api-database"
import { FunctionContext, FunctionResult, CloudFunction } from "cloud-function-engine"
import { FileStorageInterface } from "../lib/storage/interface"
import * as mongodb from "mongodb"
import { Globals } from "../lib/globals/index"
import { LocalFileStorage } from "../lib/storage/local_file_storage"
import Config from "../config"
import request from 'axios'
import { SchedulerInstance } from "../lib/scheduler"
import { getToken, parseToken } from "../lib/utils/token"
import { invokeInFunction } from "./invoke"


export type InvokeFunctionType = (name: string, param: FunctionContext) => Promise<FunctionResult>
export type EmitFunctionType = (event: string, param: any) => void
export type GetTokenFunctionType = (payload: any, secret?: string) => string
export type ParseTokenFunctionType = (token: string, secret?: string) => any | null

export interface CloudSdkInterface {
  fetch: AxiosStatic
  storage(namespace: string): FileStorageInterface
  database(): Db,
  invoke: InvokeFunctionType
  emit: EmitFunctionType
  shared: Map<string, any>
  getToken: GetTokenFunctionType
  parseToken: ParseTokenFunctionType
  mongodb: mongodb.Db
}


/**
 * Cloud SDK 实例
 */
const cloud: CloudSdkInterface = {
  database: () => Globals.createDb(),
  storage: (namespace: string) => new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace),
  fetch: request,
  invoke: invokeInFunction,
  emit: (event: string, param: any) => SchedulerInstance.emit(event, param),
  shared: CloudFunction._shared_preference,
  getToken: getToken,
  parseToken: parseToken,
  mongodb: Globals.accessor.db
}

/**
 * 等数据库连接成功后，更新其 mongo 对象，否则为 null
 */
Globals.accessor.ready.then(() => {
  cloud.mongodb = Globals.accessor.db
})

/**
 * 创建一个 SDK 实例
 * @returns 
 */
export function create() {
  const cloud: CloudSdkInterface = {
    database: () => Globals.createDb(),
    storage: (namespace: string) => new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace),
    fetch: request,
    invoke: invokeInFunction,
    emit: (event: string, param: any) => SchedulerInstance.emit(event, param),
    shared: CloudFunction._shared_preference,
    getToken: getToken,
    parseToken: parseToken,
    mongodb: Globals.accessor.db
  }
  return cloud
}

export default cloud