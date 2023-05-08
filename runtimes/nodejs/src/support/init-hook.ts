import { CLOUD_FUNCTION_COLLECTION, INIT_FUNCTION_NAME } from '../constants'
import { DatabaseAgent } from '../db'
import { CloudFunction, ICloudFunctionData } from './function-engine'
import { logger } from './logger'
import { generateUUID } from './utils'

/**
 * Init hook for `__init__` cloud function
 */
export class InitHook {
  static async invoke() {
    const func = await this.getInitCloudFunction()
    if (!func) {
      return
    }

    const cf = new CloudFunction(func)
    await cf.invoke({
      method: 'INIT',
      requestId: generateUUID(),
      __function_name: func.name,
    })

    logger.info('Init hook invoked')
  }

  /**
   * Get init hook cloud function
   * @returns
   */
  private static async getInitCloudFunction() {
    const db = DatabaseAgent.db
    const doc = await db
      .collection<ICloudFunctionData>(CLOUD_FUNCTION_COLLECTION)
      .findOne({
        name: INIT_FUNCTION_NAME,
      })

    return doc
  }
}
