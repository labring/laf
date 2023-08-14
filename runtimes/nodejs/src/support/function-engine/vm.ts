import { FunctionConsole } from './console'
import { FunctionContext, RuntimeContext } from './types'
import * as vm from 'vm'

export class FunctionVm {
  /**
   * create vm.Script
   * @param code
   * @param options
   * @returns
   */

  static createVM(code: string, options: vm.RunningScriptOptions): vm.Script {
    const script = new vm.Script(code, {
      ...options,
      importModuleDynamically: async (
        specifier: string,
        _: vm.Script,
        _importAssertions: any,
      ) => {
        return await import(specifier)
      },
    } as any)
    return script
  }

  /**
   * build sandbox
   * @param functionContext
   * @param requireFunc
   * @returns
   */

  static buildSandbox(
    functionContext: FunctionContext,
    requireFunc: any,
    fromModules?: string[],
  ): RuntimeContext {
    const fconsole = new FunctionConsole(functionContext)

    const _module = {
      exports: {},
    }

    if (!fromModules) {
      fromModules = []
    }

    const sandbox = {
      __context__: functionContext,
      __filename: functionContext.__function_name,
      module: _module,
      exports: _module.exports,
      console: fconsole,
      requireFunc: requireFunc,
      Buffer: Buffer,
      setImmediate: setImmediate,
      clearImmediate: clearImmediate,
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
      fromModules: [...fromModules],
    }

    sandbox.global = sandbox
    return sandbox
  }
}
