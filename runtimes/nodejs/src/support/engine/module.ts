import { RunningScriptOptions } from 'vm'
import { FunctionCache, FunctionModuleGlobalContext } from '.'
import Config from '../../config'
import { Console } from '.'
import * as vm from 'vm'

export class FunctionModule {
  protected static cache: Map<string, any> = new Map()

  static get(functionName: string): any {
    const moduleName = `@/${functionName}`
    return this.require(moduleName, [])
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
      const mod = this.compile(name, data.source.compiled, fromModule)

      // cache module
      if (!Config.DISABLE_MODULE_CACHE) {
        FunctionModule.cache.set(name, mod)
      }
      return mod
    }
    return require(name)
  }

  /**
   * Compile function module
   */
  static compile(
    functionName: string,
    code: string,
    fromModules: string[],
    consoleInstance?: Console,
  ): any {
    const wrapped = this.wrap(code)
    const sandbox = this.buildSandbox(
      functionName,
      fromModules,
      consoleInstance,
    )
    const options: RunningScriptOptions = {
      filename: `FunctionModule.${functionName}`,
      displayErrors: true,
      contextCodeGeneration: {
        strings: false,
      },
    } as any
    const script = this.createScript(wrapped, {})
    return script.runInNewContext(sandbox, options)
  }

  static deleteCache(): void {
    FunctionModule.cache.clear()
  }

  protected static wrap(code: string): string {
    return `
    const require = (name) => {
      __from_modules.push(__filename)
      return __require(name, __from_modules)
    }

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
    consoleInstance?: Console,
  ): FunctionModuleGlobalContext {
    const _module = {
      exports: {},
    }

    const fConsole = consoleInstance || new Console(functionName)
    const __from_modules = fromModules || []

    const sandbox: FunctionModuleGlobalContext = {
      __filename: functionName,
      module: _module,
      exports: _module.exports,
      console: fConsole,
      __require: this.require.bind(this),
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
      __from_modules: [...__from_modules],
    }
    sandbox.global = sandbox
    return sandbox
  }
}
