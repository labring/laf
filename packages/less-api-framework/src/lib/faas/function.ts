import { FunctionEngine } from "."
import { LocalFileStorage } from "../storage/local_file_storage"
import request from 'axios'
import Config from "../../config"
import { CloudFunctionStruct, CloudSdkInterface, FunctionContext, FunctionResult } from "./types"
import { getToken, parseToken } from "../utils/token"
import * as ts from 'typescript'
import { FunctionConsole } from "./console"
import {  getFunctionByName } from "../../api/function"
import { Globals } from "../globals"
import { Scheduler } from "../scheduler"

export class CloudFunction {
  // 跨请求、跨函数的全局配置对象，单例（in memory）
  static _shared_preference = new Map<string, any>()

  /**
   * 函数结构
   */
  protected _data: CloudFunctionStruct

  /**
   * 函数调用参数
   */
  param: FunctionContext

  /**
   * 函数执行结果
   */
  result: FunctionResult

  /**
   * 日志对象
   */
  console: FunctionConsole

  /**
   *  函数ID
   */
  get id() {
    return this._data._id
  }

  /**
   * 函数显示名称
   */
  get name() {
    return this._data.name
  }

  /**
   * 函数源码
   */
  get code() {
    return this._data.code
  }

  /**
   * 函数编译后的代码
   */
  get compiledCode() {
    return this._data.compiledCode
  }

  /**
   * 是否允许 HTTP 访问
   */
  get enableHTTP() {
    return this._data.enableHTTP
  }

  /**
   * 启停状态
   */
  get status() {
    return this._data.status
  }

  constructor(data: CloudFunctionStruct) {
    this._data = data
  }

  /**
   * 调用云函数
   * @param param 函数调用参数
   * @returns 
   */
  async invoke(param: FunctionContext) {
    this.param = param
    const sdk = this.createCloudSdk()

    const engine = new FunctionEngine(param, sdk)

    this.console = engine.console
    this.result = await engine.run(this.compiledCode)

    return this.result
  }

  /**
   * 创建云函数 cloud sdk
   * @returns 
   */
  createCloudSdk(): CloudSdkInterface {
    const cloud: CloudSdkInterface = {
      database: () => Globals.createDb(),
      storage: (namespace: string) => new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace),
      fetch: request,
      invoke: this.invokeInFunction,
      emit: (event: string, param: any) => Scheduler.emit(event, param),
      shared: CloudFunction._shared_preference,
      getToken: getToken,
      parseToken: parseToken,
      mongodb: Globals.accessor.db
    }

    return cloud
  }

  /**
   * 在云函数中[调用云函数]
   */
  protected async invokeInFunction(name: string, param: FunctionContext) {
    const data = await getFunctionByName(name)
    const func = new CloudFunction(data)

    if (!func) {
      throw new Error(`invoke() failed to get function: ${name}`)
    }

    if(!func.compiledCode) {
      func.compile2js()
    }

    param = param ?? {}
    
    if(param.requestId) {
      param.requestId = this.param.requestId
    }

    if (param.method) {
      param.method = param.method ?? 'call'
    }

    const result = await func.invoke(param)
    return result
  }

  /**
   * 编译云函数（TS） 到 JS
   * @param {string} source ts 代码字符串
   */
  compile2js() {
    const jscode = ts.transpile(this.code, {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017,
      removeComments: true,
    })

    this._data.compiledCode = jscode
  }
}

