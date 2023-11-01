import Config from '../../config'
import path from 'path'
import { FunctionCache } from './cache'
import { FunctionContext } from './types'

import { buildSandbox, createScript } from './utils'

export class FunctionModule {
  private static cache: Map<string, any> = new Map()

  static require(name: string, fromModule: string[], filename: string): any {
    if (name === '@/cloud-sdk') {
      return require('@lafjs/cloud')
    } else if (
      name.startsWith('@/') ||
      name.startsWith('./') ||
      name.startsWith('../')
    ) {
      if (!name.startsWith('@/')) {
        const dirname = '/'
        const filePath = path.join(
          path.dirname(dirname + filename),
          name,
        )
        name = filePath.slice(dirname.length)
      } else {
        name = name.replace('@/', '')
      }

      // check cache
      if (FunctionModule.cache.has(name)) {
        return FunctionModule.cache.get(name)
      }

      // check circular dependency
      if (fromModule?.indexOf(name) !== -1) {
        throw new Error(
          `circular dependency detected: ${fromModule.join(' -> ')} -> ${name}`,
        )
      }

      // build function context
      const functionContext: FunctionContext = {
        requestId: '',
        __function_name: name,
      }

      // build function module
      const data = FunctionCache.get(name)
      const functionModule = FunctionModule.build(
        data.source.compiled,
        functionContext,
        fromModule,
      )

      // cache module
      if (Config.DISABLE_MODULE_CACHE) {
        FunctionModule.cache.set(name, functionModule)
      }
      return functionModule
    }
    return require(name)
  }

  /**
   * build function module
   * @param code
   * @param functionContext
   * @param fromModule
   * @returns
   */
  private static build(
    code: string,
    functionContext: FunctionContext,
    fromModule: string[],
  ): any {
    code = FunctionModule.wrap(code)
    const sandbox = buildSandbox(functionContext, fromModule)
    const script = createScript(code, {})
    return script.runInNewContext(sandbox, {})
  }

  static deleteCache(name: string): void {
    FunctionModule.cache.delete(name)
  }

  static deleteAllCache(): void {
    FunctionModule.cache.clear()
  }

  private static wrap(code: string): string {
    return `
    const require = (name) => {
      fromModule.push(__filename)
      return requireFunc(name, fromModule, __filename)
    }
    const exports = {};
    ${code}
    exports;
    `
  }
}
