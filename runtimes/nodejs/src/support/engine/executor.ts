import { FunctionContext, FunctionResult, ICloudFunctionData } from './types'
import { nanosecond2ms } from '../utils'
import { INTERCEPTOR_FUNCTION_NAME } from '../../constants'
import { FunctionModule } from './module'
import assert from 'assert'
import { DebugConsole } from './console'
import { logger } from '../logger'

export class FunctionExecutor {
  /**
   * cloud function data struct
   */
  protected data: ICloudFunctionData
  constructor(data: ICloudFunctionData) {
    assert(data, 'function data cannot be empty')
    this.data = data
  }

  async invoke(
    context: FunctionContext,
    useInterceptor: boolean,
  ): Promise<FunctionResult> {
    const startTime = process.hrtime.bigint()

    try {
      const mod = this.getModule()
      const main = mod.default || mod.main
      if (!main) {
        throw new Error('FunctionExecutionError: `main` function not found')
      }

      if (typeof main !== 'function') {
        throw new Error(
          'FunctionExecutionError: `main` function must be callable',
        )
      }

      let data = null
      if (this.data.name === INTERCEPTOR_FUNCTION_NAME) {
        data = await main(context, () => {})
      } else if (useInterceptor) {
        data = await this.invokeWithInterceptor(context, main)
      } else {
        data = await main(context)
      }

      const endTime = process.hrtime.bigint()
      const timeUsage = nanosecond2ms(endTime - startTime)
      return {
        data,
        time_usage: timeUsage,
      }
    } catch (error) {
      const endTime = process.hrtime.bigint()
      const timeUsage = nanosecond2ms(endTime - startTime)

      return {
        error,
        time_usage: timeUsage,
      }
    }
  }

  protected async invokeWithInterceptor(
    context: FunctionContext,
    next?: (context: FunctionContext) => Promise<unknown>,
  ) {
    const mod = FunctionModule.get(INTERCEPTOR_FUNCTION_NAME)
    const interceptor = mod.default || mod.main
    if (!interceptor) {
      throw new Error(
        'FunctionExecutionError: `__interceptor__` function not found',
      )
    }

    if (typeof interceptor !== 'function') {
      throw new Error(
        'FunctionExecutionError: `__interceptor__` function must be callable',
      )
    }

    if (interceptor.length === 2) {
      return interceptor(context, next)
    } else {
      logger.warn(
        'WARNING: the old style interceptor function is deprecated in `__interceptor__`, use `next()` as its second param instead',
      )
      const res = await interceptor(context)
      if (res === false) {
        return {
          __type__: '__interceptor__',
          __res__: false,
        }
      }
      return next(context)
    }
  }

  protected getModule() {
    const mod = FunctionModule.get(this.data.name)
    return mod
  }
}

export class FunctionDebugExecutor extends FunctionExecutor {
  protected consoleInstance: DebugConsole

  constructor(data: ICloudFunctionData, consoleInstance: DebugConsole) {
    super(data)
    this.consoleInstance = consoleInstance
  }
  /**
   * @override override to
   */
  protected getModule() {
    const name = this.data.name
    const code = this.data.source.compiled
    const mod = FunctionModule.compile(name, code, [], this.consoleInstance)
    return mod
  }
}
