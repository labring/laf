// import fetch from 'node-fetch'
import { URL } from 'node:url'

import * as vm from 'vm'
import { nanosecond2ms } from '../utils'
import { FunctionConsole } from './console'
import { FunctionContext, FunctionResult, RequireFuncType, RuntimeContext } from './types'


/**
 * Default require function
 */
const defaultRequireFunction: RequireFuncType = (module): any => {
  return require(module) as any
}

/**
 * Function engine
 */
export class FunctionEngine {

  require_func: RequireFuncType

  constructor(require_func?: RequireFuncType) {
    this.require_func = require_func ?? defaultRequireFunction
  }

  /**
   * Execute function
   * @returns 
   */
  async run(code: string, context: FunctionContext, options: vm.RunningScriptOptions): Promise<FunctionResult> {
    const sandbox = this.buildSandbox(context)
    const wrapped = this.wrap(code)
    const fconsole = sandbox.console

    const _start_time = process.hrtime.bigint()
    try {
      const script = new vm.Script(wrapped, options)
      const result = script.runInNewContext(sandbox, options)

      let data = result
      if (typeof result?.then === 'function') {
        data = await result
      }

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
   * build sandbox
   * @returns 
   */
  buildSandbox(functionContext: FunctionContext): RuntimeContext {
    const fconsole = new FunctionConsole()

    const _module = {
      exports: {}
    }
    const sandbox = {
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
      clearTimeout: clearTimeout,
      process: { env: {} },
      URL: URL,
      fetch: globalThis.fetch,
      global: null,
    }

    sandbox.global = sandbox
    return sandbox
  }

  /**
   * wrap function code
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