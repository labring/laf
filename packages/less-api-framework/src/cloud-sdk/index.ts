import { AxiosStatic } from "axios"
import { Db } from "less-api-database"
import { FunctionContext, FunctionResult } from "../lib/faas/types"
import { FileStorageInterface } from "../lib/storage/interface"
import * as mongodb from "mongodb"
import { Globals } from "../lib/globals"
import { LocalFileStorage } from "../lib/storage/local_file_storage"
import Config from "../config"
import request from 'axios'
import { Scheduler } from "../lib/scheduler"
import { CloudFunction } from "../lib/faas"
import { getToken, parseToken } from "../lib/utils/token"
import { invokeInFunction } from "./invoke"


export type InvokeFunctionType = (name: string, param: FunctionContext) => Promise<FunctionResult>
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
  mongodb: mongodb.Db
}


const cloud: CloudSdkInterface = {
  database: () => Globals.createDb(),
  storage: (namespace: string) => new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace),
  fetch: request,
  invoke: invokeInFunction,
  emit: (event: string, param: any) => Scheduler.emit(event, param),
  shared: CloudFunction._shared_preference,
  getToken: getToken,
  parseToken: parseToken,
  mongodb: Globals.accessor.db
}


export default cloud