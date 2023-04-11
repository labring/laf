import { CLOUD_FUNCTION_COLLECTION } from '../../constants'
import { DatabaseAgent } from '../../db'
import { ICloudFunctionData, RequireFuncType } from './types'
import { FunctionRequire } from './require'
import { logger } from '../logger'
import assert from 'assert'

export class FunctionCache {
  private static cache: Map<string, ICloudFunctionData> = new Map()

  static async initialize() {
    logger.info('initialize function cache')
    const funcs = await DatabaseAgent.db
      .collection<ICloudFunctionData>(CLOUD_FUNCTION_COLLECTION)
      .find()
      .toArray()

    for (const func of funcs) {
      FunctionCache.cache.set(func.name, func)
    }

    this.streamChange()
    logger.info('Function cache initialized.')
  }

  /**
   * require a module from cloud function
   * @param module
   * @returns
   */
  static requireCloudFunction(moduleName: string): any {
    const func = FunctionCache.cache.get(moduleName)
    assert(
      func,
      `require cloud function failed: function ${moduleName} not found`,
    )
    const funcRequire = new FunctionRequire(this.requireFunc)
    const module = funcRequire.load(func.name, func.source.compiled)
    return module
  }

  /**
   * stream the change of cloud function
   * @param
   * @returns
   */
  static async streamChange() {
    logger.info('Listening for changes in cloud function collection...')
    const stream = DatabaseAgent.db
      .collection(CLOUD_FUNCTION_COLLECTION)
      .watch()
    stream.on('change', async (change) => {
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
            this.cache.delete(funcName)
          }
        }
      }
    })
  }

  /**
   * Custom require function in cloud function
   * @see FunctionEngine.require_func
   * @param module the module id. ex. `path`, `lodash`
   * @returns
   */
  static requireFunc: RequireFuncType = (module: string): any => {
    if (module === '@/cloud-sdk') {
      return require('@lafjs/cloud')
    }
    if (module.startsWith('@/')) {
      return FunctionCache.requireCloudFunction(module.replace('@/', ''))
    }
    return require(module) as any
  }

  static getFunctionByName(funcName: string): ICloudFunctionData {
    return FunctionCache.cache.get(funcName)
  }
}
