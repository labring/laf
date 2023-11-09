import { FunctionContext, FunctionResult, ICloudFunctionData } from './types'
import { nanosecond2ms } from '../utils'
import _ from 'lodash'
import { INTERCEPTOR_FUNCTION_NAME } from '../../constants'
import { FunctionModule } from './module'

export class CloudFunction {
  /**
   * object shared cross all functions & requests
   */
  static _shared_preference = new Map<string, any>()

  /**
   * function data struct
   */
  data: ICloudFunctionData

  constructor(data: ICloudFunctionData) {
    this.data = data
  }

  async invoke(
    context: FunctionContext,
    useInterceptor: boolean,
  ): Promise<FunctionResult> {
    const fn = this.data.name
    const startTime = process.hrtime.bigint()

    try {
      const mod = FunctionModule.getModule(fn)
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
      if (useInterceptor) {
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
    next?: Function,
  ) {
    const mod = FunctionModule.getModule(INTERCEPTOR_FUNCTION_NAME)
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
}
