import { INIT_FUNCTION_NAME } from '../constants'
import { FunctionCache, FunctionExecutor } from './engine'
import { logger } from './logger'

/**
 * Init hook for `__init__` cloud function
 */
export class InitHook {
  static async invoke() {
    const func = FunctionCache.get(INIT_FUNCTION_NAME)
    if (!func) {
      return
    }
    const executor = new FunctionExecutor(func)
    const result = await executor.invoke(
      {
        method: 'INIT',
        __function_name: func.name,
      },
      false,
    )

    if (result.error) {
      return logger.error(result.error)
    }

    logger.info('__init__ hook invoked')
  }
}
