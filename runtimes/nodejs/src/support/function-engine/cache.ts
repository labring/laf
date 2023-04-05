import { CLOUD_FUNCTION_COLLECTION } from '../../constants'
import { DatabaseAgent } from '../../db'
import { md5, sleep } from '../utils'
import { ObjectId } from 'mongodb'
import { ICloudFunctionData, RequireFuncType } from './types'
import { FunctionRequire } from './require'
import { logger } from '../logger'
import { FunctionEngine } from '.'

export class FunctionCache {
  // document id -> function name, use for get function name by id
  private static idCache: Map<ObjectId, string> = new Map()
  // function name -> function module
  private static moduleCache: Map<string, any> = new Map()
  // function name -> function data
  private static functionCache: Map<string, ICloudFunctionData> = new Map()
  // function name -> function vm.script
  private static engineCache: Map<string, FunctionEngine> = new Map()

  static async initialize() {
    await sleep(5000)
    logger.info('initialize function cache')
    const funcDB = await DatabaseAgent.db.collection<ICloudFunctionData>(
      CLOUD_FUNCTION_COLLECTION,
    )

    const functions = await funcDB.find().toArray()
    for (const func of functions) {
      FunctionCache.functionCache.set(func.name, func)
    }

    // process moudule
    for (const func of functions) {
      FunctionCache.idCache.set(func._id, func.name)
      const funcRequire = new FunctionRequire(FunctionCache.requireFunc)
      const module = funcRequire.load(func.name, func.source.compiled)
      FunctionCache.moduleCache.set(func.name, module)
    }

    // process function engine
    for (const func of functions) {
      const functionEngine = new FunctionEngine(
        func.source.compiled,
        FunctionCache.requireFunc,
      )
      FunctionCache.engineCache.set(func.name, functionEngine)
    }

    this.streamChange()
    logger.info('Function cache initialized.')
  }

  /**
   * require a module from cloud function
   * @param module
   * @returns
   */
  static requireCloudFunction(module): any {
    const moduleCache = FunctionCache.moduleCache.get(module)
    if (moduleCache) {
      return moduleCache
    } else {
      const func = FunctionCache.functionCache.get(module)
      if (func) {
        const funcRequire = new FunctionRequire(this.requireCloudFunction)
        const module = funcRequire.load(func.name, func.source.compiled)
        FunctionCache.moduleCache.set(func.name, module)
        return module
      }
      return {}
    }
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
        // set cache
        FunctionCache.idCache.set(func._id, func.name)
        FunctionCache.functionCache.set(func.name, func)

        // load module
        const funcRequire = new FunctionRequire(FunctionCache.requireFunc)
        const module = funcRequire.load(
          change.fullDocument.name,
          change.fullDocument.source.compiled,
        )
        FunctionCache.moduleCache.set(change.fullDocument.name, module)

        // load engine
        const functionEngine = new FunctionEngine(
          change.fullDocument.source.compiled,
          FunctionCache.requireFunc,
        )
        FunctionCache.engineCache.set(change.fullDocument.name, functionEngine)
      } else if (change.operationType == 'delete') {
        if (FunctionCache.idCache.has(change.documentKey._id)) {
          const funcName = FunctionCache.idCache.get(change.documentKey._id)

          // delete cache
          FunctionCache.engineCache.delete(funcName)
          FunctionCache.moduleCache.delete(funcName)
          FunctionCache.functionCache.delete(funcName)
          FunctionCache.idCache.delete(change.documentKey._id)
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

  static getFunctionEngine(func: ICloudFunctionData): FunctionEngine {
    if (
      FunctionCache.engineCache.has(func.name) &&
      FunctionCache.functionCache.has(func.name) &&
      md5(FunctionCache.functionCache.get(func.name).source.compiled) ===
        md5(func.source.compiled)
    ) {
      logger.info(`get function engine ${func.name} from cache`)
      return FunctionCache.engineCache.get(func.name)
    }
    const functionEngine = new FunctionEngine(
      func.source.compiled,
      FunctionCache.requireFunc,
    )
    return functionEngine
  }
}
