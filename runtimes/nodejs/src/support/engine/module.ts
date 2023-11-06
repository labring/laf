import { RunningScriptOptions } from 'vm'
import { FunctionCache, FunctionContext } from '.'
import Config from '../../config'
import { buildSandbox, createScript } from './utils'

export class FunctionModule {
  private static cache: Map<string, any> = new Map()

  static get(functionName: string): any {
    const moduleName = `@/${functionName}`
    return FunctionModule.require(moduleName, [])
  }

  static require(name: string, fromModule: string[]): any {
    if (name === '@/cloud-sdk') {
      return require('@lafjs/cloud')
    } else if (name.startsWith('@/')) {
      name = name.replace('@/', '')

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
      if (!Config.DISABLE_MODULE_CACHE) {
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
    const options: RunningScriptOptions = {
      filename: `CloudFunction.${functionContext.__function_name}`,
      displayErrors: true,
      contextCodeGeneration: {
        strings: false,
      },
    } as any
    const script = createScript(code, {})
    return script.runInNewContext(sandbox, options)
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
      return requireFunc(name, fromModule)
    }
    const exports = {};
    ${code}
    exports;
    `
  }
}
