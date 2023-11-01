import { RunningScriptOptions } from 'vm'
import { FunctionContext, FunctionResult, ICloudFunctionData } from './types'
import { buildSandbox, createScript } from './utils'
import { nanosecond2ms } from '../utils'
import { FunctionCache } from './cache'
import _ from 'lodash'
import { INTERCEPTOR_FUNCTION_NAME } from '../../constants'

export class CloudFunction {
  /**
   * object shared cross all functions & requests
   */
  static _shared_preference = new Map<string, any>()

  /**
   * execution timeout
   */
  timeout = 600 * 1000

  /**
   * function data struct
   */
  data: ICloudFunctionData

  /**
   * function context
   */
  param: FunctionContext

  /**
   * execution result
   */
  result: FunctionResult

  constructor(data: ICloudFunctionData) {
    this.data = data
  }

  /**
   * execute function
   * @param param
   * @returns
   */
  async execute(
    param: FunctionContext,
    useInterceptor: boolean = false,
    debugConsole: any = null,
  ): Promise<FunctionResult> {
    const sandbox = buildSandbox(param, [], debugConsole)
    let code = ``
    if (useInterceptor) {
      const interceptorFunc = FunctionCache.get(INTERCEPTOR_FUNCTION_NAME)
      code = this.warpWithInterceptor(
        this.data.source.compiled,
        interceptorFunc.source.compiled,
      )
    } else {
      code = this.wrap(this.data.source.compiled)
    }
    const script = createScript(code, {})
    const options: RunningScriptOptions = {
      filename: `CloudFunction.${this.data.name}`,
      timeout: this.timeout,
      displayErrors: true,
      contextCodeGeneration: {
        strings: false,
      },
    } as any

    const _start_time = process.hrtime.bigint()
    try {
      const result = script.runInNewContext(sandbox, options)
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
      const _end_time = process.hrtime.bigint()
      const time_usage = nanosecond2ms(_end_time - _start_time)

      return {
        error: error,
        time_usage,
      }
    }
  }

  /**
   * create vm.Script
   * @param code
   */
  wrap(code: string): string {
    const wrapped = `
      const require = (module) => {
        fromModule.push(__filename)
        return requireFunc(module, fromModule, __filename)
      }
      ${code}; 
      const __main__ = exports.main || exports.default
      if(!__main__) { throw new Error('FunctionExecError: main function not found') }
      if(typeof __main__ !== 'function') { throw new Error('FunctionExecError: main function must be callable')}
      __main__(__context__ )
      `
    return wrapped
  }

  /**
   * wrapping code using interceptors
   * @param code
   * @param interceptorCode
   */
  warpWithInterceptor(code: string, interceptorCode: string): string {
    const wrapped = `
      const require = (module) => {
        fromModule.push(__filename)
        return requireFunc(module, fromModule, __filename)
      }

      function __next__() {
        const exports = {}
        ${code}
        const __main__ = exports.main || exports.default
        if(!__main__) { throw new Error('FunctionExecError: main function not found') }
        if(typeof __main__ !== 'function') { throw new Error('FunctionExecError: main function must be callable')}
        return __main__
      }
      ${interceptorCode}
      const __interceptor__ = exports.main || exports.default
      if(!__interceptor__) { throw new Error('FunctionExecError: interceptor function not found') }
      if(typeof __interceptor__ !== 'function') { throw new Error('FunctionExecError: interceptor function must be callable')}
      
      async function __flow__(ctx) {
        if (__interceptor__.length === 2) {
          return __interceptor__(__context__, __next__())
        } else {
          const interceptRes = await __interceptor__(__context__)
          if (interceptRes === false) {
            return {'__type__': '__interceptor__', '__res__': false}
          }
          return __next__()(ctx)
        }
      }
      __flow__(__context__)
    `
    return wrapped
  }
}
