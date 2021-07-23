
import * as vm from 'vm'
import { nanosecond2ms } from '../utils/time'
import { FunctionConsole } from './console'
import { CloudSdkInterface, FunctionContext, FunctionResult, RequireFuncType, RuntimeContext } from './types'

const require_func: RequireFuncType = (module): any => {
  return require(module) as any
}

/**
 * 云函数执行引擎
 */
export class FunctionEngine {

  protected sandbox: RuntimeContext

  get console() {
    return this.sandbox?.console
  }

  constructor(context: FunctionContext, sdk: CloudSdkInterface) {
    this.sandbox = this.buildSandbox(context, sdk)
  }

  /**
   * 执行云函数
   * @param code 函数代码（js)
   * @param incomingCtx 
   * @returns 
   */
  async run(code: string): Promise<FunctionResult> {
    const sandbox = this.sandbox

    const wrapped = this.wrap(code)
    const fconsole = this.console

    // 调用前计时
    const _start_time = process.hrtime.bigint()
    try {
      const script = new vm.Script(wrapped)
      script.runInNewContext(sandbox)
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
  buildSandbox(functionContext: FunctionContext, functionSdk: CloudSdkInterface) {
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
      less: functionSdk,
      cloud: functionSdk,
      require: require_func,
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