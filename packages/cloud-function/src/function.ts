import { FunctionEngine } from "."
import { CloudFunctionStruct, FunctionContext, FunctionResult, RequireFuncType } from "./types"
import * as assert from "assert"

/**
 * 云函数
 * 云函数实例，可编译、运行云函数
 */
export class CloudFunction {
  /**
   * 跨请求、跨函数的全局配置对象，单例（in memory）
   */
  static _shared_preference = new Map<string, any>()

  /**
   * 自定义 require function，如果未设置，则使用云函数引擎默认 require
   * @see FunctionEngine.require_func
   */
  static require_func: RequireFuncType

  /**
    * 函数执行超时时间
    */
  timeout = 60 * 1000

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

  constructor(data: CloudFunctionStruct) {
    assert.ok(data)
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

    this.result = await engine.run(this.compiledCode, param, {
      filename: `CloudFunction.${this.name}`,
      timeout: this.timeout,
      displayErrors: true,
      /**
       * 若关闭此项，则异步中的死循环无法被 timeout 捕捉，且会让工作线程陷入黑洞，
       * 若打开此项，则异步 IO 会让工作线程陷入黑洞，
       * 两者取其轻，还是选择关闭此项。
       */
      // microtaskMode: 'afterEvaluate',
      contextCodeGeneration: {
        strings: false
      }
    } as any)

    return this.result
  }
}

