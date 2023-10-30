import { ICloudFunctionData } from './types'
import { CloudFunction } from './function'
import { logger } from '../logger'
import { DatabaseAgent } from '../../db'
import { CLOUD_FUNCTION_COLLECTION } from '../../constants'
import { InitHook } from '../init-hook'
import { DatabaseChangeStream } from '../database-change-stream'
import { FunctionModule } from './module'

export class FunctionCache {
  private static cache: Map<string, ICloudFunctionData> = new Map()

  static async initialize(): Promise<void> {
    logger.info('initialize function cache')
    const funcs = await DatabaseAgent.db
      .collection<ICloudFunctionData>(CLOUD_FUNCTION_COLLECTION)
      .find()
      .toArray()

    for (const func of funcs) {
      FunctionCache.cache.set(func.name, func)
    }

    DatabaseChangeStream.onStreamChange(
      CLOUD_FUNCTION_COLLECTION,
      FunctionCache.streamChange.bind(this),
    )
    logger.info('Function cache initialized.')

    // invoke init function
    InitHook.invoke()
  }

  /**
   * stream the change of cloud function
   * @param change
   * @returns
   */
  private static async streamChange(change): Promise<void> {
    if (change.operationType === 'insert') {
      const func = await DatabaseAgent.db
        .collection<ICloudFunctionData>(CLOUD_FUNCTION_COLLECTION)
        .findOne({ _id: change.documentKey._id })

      // add func in map
      FunctionCache.cache.set(func.name, func)
    } else if (change.operationType == 'delete') {
      // remove this func
      for (const [funcName, func] of this.cache) {
        if (change.documentKey._id.equals(func._id)) {
          FunctionCache.cache.delete(funcName)
          FunctionModule.deleteAllCache()
        }
      }
    }
  }

  static get(name: string): ICloudFunctionData {
    return FunctionCache.cache.get(name)
  }

  static getEngine(name: string): CloudFunction {
    const func = FunctionCache.get(name)
    if (!func) return null
    return new CloudFunction(func)
  }
}
