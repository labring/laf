
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
  async run(code: string, context: FunctionContext, options: vm.RunningScriptOptions): Promise<FunctionResult> {
    const sandbox = this.buildSandbox(context)
    const wrapped = this.wrap(code)
    const fconsole = sandbox.console

    // 调用前计时
    const _start_time = process.hrtime.bigint()
    try {
      const script = new vm.Script(wrapped, options)
      const result = script.runInNewContext(sandbox, options)

      let data = result
      if (typeof result?.then === 'function') {
        /**
         * 由于 vm 内部的 microTasks queue 为空时会直接释放执行环境，后续 await 则会导致工作线程陷入黑洞，
         * 故需先给 vm 返回的 promise 设置 then 回调，使 microTasks queue 不为空，以维护 vm 执行环境暂不被释放
         */
        const promise = new Promise((resolve, reject) => {
          result
            .then(resolve)
            .catch(reject)
        })

        data = await promise
      }

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
      __filename: functionContext.__function_name,
      module: _module,
      exports: _module.exports,
      console: fconsole,
      require: this.require_func,
      Buffer: Buffer,
      setImmediate: setImmediate,
      clearImmediate: clearImmediate,
      setInterval: setInterval,
      clearInterval: clearInterval,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout
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
      __main__(__context__ )
      `
    return wrapped
  }
}