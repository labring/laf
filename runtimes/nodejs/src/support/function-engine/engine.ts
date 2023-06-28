import * as vm from 'vm'
import { nanosecond2ms } from '../utils'
import { FunctionContext, FunctionResult, RequireFuncType } from './types'
import { FunctionVm } from './vm'

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
  requireFunc: RequireFuncType

  script: vm.Script

  constructor(code: string, require_func?: RequireFuncType) {
    this.script = FunctionVm.createVM(this.wrap(code), {})
    this.requireFunc = require_func ?? defaultRequireFunction
  }

  /**
   * Execute function
   * @returns
   */
  async run(
    context: FunctionContext,
    options: vm.RunningScriptOptions,
  ): Promise<FunctionResult> {
    const sandbox = FunctionVm.buildSandbox(context, this.requireFunc)
    const fconsole = sandbox.console

    const _start_time = process.hrtime.bigint()
    try {
      const result = this.script.runInNewContext(sandbox, options)
      let data = result
      if (typeof result?.then === 'function') {
        data = await result
      }

      const _end_time = process.hrtime.bigint()
      const time_usage = nanosecond2ms(_end_time - _start_time)
      return {
        data,
        time_usage,
      }
    } catch (error) {
      fconsole.log(error.message, error.stack)

      const _end_time = process.hrtime.bigint()
      const time_usage = nanosecond2ms(_end_time - _start_time)

      return {
        error: error,
        time_usage,
      }
    }
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
