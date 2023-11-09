import { RunningScriptOptions } from 'vm'
import { FunctionCache, FunctionContext, FunctionModuleGlobalContext } from '.'
import Config from '../../config'
import { Console } from '.'
import * as vm from 'vm'

export class FunctionModule {
  protected static cache: Map<string, any> = new Map()

  static getModule(functionName: string): any {
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

      // build function module
      const data = FunctionCache.get(name)
      const functionModule = FunctionModule.build(
        name,
        data.source.compiled,
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
   * Build function module
   */
  protected static build(
    functionName: string,
    code: string,
    fromModules: string[],
  ): any {
    const wrapped = FunctionModule.wrap(code)
    const sandbox = this.buildSandbox(functionName, fromModules)
    const options: RunningScriptOptions = {
      filename: `CloudFunction.${functionName}`,
      displayErrors: true,
      contextCodeGeneration: {
        strings: false,
      },
    } as any
    const script = this.createScript(wrapped, {})
    return script.runInNewContext(sandbox, options)
  }

  static deleteAllCache(): void {
    FunctionModule.cache.clear()
  }

  protected static wrap(code: string): string {
    return `
    const require = (name) => {
      __from_modules.push(__filename)
      return __require(name, __from_modules)
    }

    const exports = {};
    ${code}
    exports;
    `
  }

  /**
   * Create vm.Script
   */
  protected static createScript(
    code: string,
    options: vm.RunningScriptOptions,
  ): vm.Script {
    const _options = {
      ...options,

      importModuleDynamically: async (
        specifier: string,
        _: vm.Script,
        _importAssertions: any,
      ) => {
        return await import(specifier)
      },
    } as any

    const script = new vm.Script(code, _options)
    return script
  }

  /**
   * Build function module global sandbox
   */
  protected static buildSandbox(
    functionName: string,
    fromModules: string[],
    consoleInstance: Console = null,
  ): FunctionModuleGlobalContext {
    const _module = {
      exports: {},
    }
    fromModules = fromModules || []

    const fConsole = consoleInstance || new Console(functionName)

    const sandbox: FunctionModuleGlobalContext = {
      __filename: functionName,
      module: _module,
      exports: _module.exports,
      console: fConsole,
      __require: FunctionModule.require,
      Buffer: Buffer,
      setImmediate: setImmediate,
      clearImmediate: clearImmediate,
      Float32Array: Float32Array,
      setInterval: setInterval,
      clearInterval: clearInterval,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      process: {
        env: { ...process.env },
      },
      URL: URL,
      fetch: globalThis.fetch,
      global: null,
      __from_modules: [...fromModules],
    }
    sandbox.global = sandbox
    return sandbox
  }
}

export class DebugFunctionModule extends FunctionModule {}
