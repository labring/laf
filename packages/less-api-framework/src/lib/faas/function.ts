import { FunctionEngine } from "."
import { CloudFunctionStruct, FunctionContext, FunctionResult, RequireFuncType } from "./types"
import * as ts from 'typescript'

/**
 * 云函数
 * 云函数实例，可编译、运行云函数
 */
export class CloudFunction {
  // 跨请求、跨函数的全局配置对象，单例（in memory）
  static _shared_preference = new Map<string, any>()

  /**
   * 自定义 require function，如果未设置，则使用云函数引擎默认 require
   * @see FunctionEngine.require_func
   */
  static require_func: RequireFuncType

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

    const engine = new FunctionEngine(CloudFunction.require_func)

    this.result = await engine.run(this.compiledCode, param)

    return this.result
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

