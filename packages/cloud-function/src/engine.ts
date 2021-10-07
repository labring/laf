
import * as vm from 'vm'
import { nanosecond2ms } from './utils'
import { FunctionConsole } from './console'
import { FunctionContext, FunctionResult, RequireFuncType, RuntimeContext } from './types'


/**
 * 云函数中加载依赖包的函数: require('') 
 */
const defaultRequireFunction: RequireFuncType = (module): any => {
  return require(module) as any
}

/**
 * 云函数执行引擎
 */
export class FunctionEngine {

  /**
   * 函数执行超时时间
   */
  timeout = 60 * 1000

  /**
   * 云函数中加载依赖包的函数: require('') 
   */
  require_func: RequireFuncType

  constructor(require_func?: RequireFuncType) {
    this.require_func = require_func ?? defaultRequireFunction
  }

  /**
   * 执行云函数
   * @param code 函数代码（js)
   * @param incomingCtx 
   * @returns 
   */
  async run(code: string, context: FunctionContext): Promise<FunctionResult> {
    const sandbox = this.buildSandbox(context)
  

    const wrapped = this.wrap(code)
    const fconsole = sandbox.console

    // 调用前计时
    const _start_time = process.hrtime.bigint()
    try {
      const script = new vm.Script(wrapped)
      script.runInNewContext(sandbox, { timeout: this.timeout })
      const data = await sandbox.__runtime_promise

      // 函数执行耗时
      const _end_time = process.hrtime.bigint()
      const time_usage = nanosecond2ms(_end_time - _start_time)
      return {
        data,
        logs: fconsole.logs,
        time_usage
      }
    } catch (error) {
      fconsole.log(error.message)
      fconsole.log(error.stack)

      // 函数执行耗时
      const _end_time = process.hrtime.bigint()
      const time_usage = nanosecond2ms(_end_time - _start_time)

      return {
        error: error,
        logs: fconsole.logs,
        time_usage
      }
    }
  }


  /**
   * 构建函数运行时沙箱环境
   * @param incomingCtx 
   * @returns 
   */
  buildSandbox(functionContext: FunctionContext): RuntimeContext {
    const fconsole = new FunctionConsole()

    const _module = {
      exports: {}
    }
    return {
      __context__: functionContext,
      module: _module,
      exports: _module.exports,
      __runtime_promise: null,
      console: fconsole,
      require: this.require_func,
      Buffer: Buffer
    }
  }

  /**
   * 封装执行函数的代码
   * @param code 函数代码
   */
  wrap(code: string): string {
    const wrapped = `
      ${code}; 
      const __main__ = exports.main || exports.default
      if(!__main__) { throw new Error('FunctionExecError: main function not found') }
      if(typeof __main__ !== 'function') { throw new Error('FunctionExecError: main function must be callable')}
      __runtime_promise = __main__(__context__ )
      `
    return wrapped
  }
}