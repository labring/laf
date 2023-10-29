import { Console } from './console'
import { FunctionModule } from './module'
import { FunctionContext, RuntimeContext } from './types'
import * as vm from 'vm'

/**
 * create vm.Script
 * @param code
 * @param options
 * @returns
 */

export function createScript(
  code: string,
  options: vm.RunningScriptOptions,
): vm.Script {
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
 * @param param
 * @returns
 */
export function buildSandbox(
  functionContext: FunctionContext,
  fromModule: string[],
  debugConsole: any = null,
): RuntimeContext {

  const _module = {
    exports: {},
  }

  if (!fromModule) {
    fromModule = []
  }

  let fConsole = null
  if (debugConsole) {
    fConsole = debugConsole
  } else {
    fConsole = new Console()
  }

  const sandbox = {
    __context__: functionContext,
    __filename: functionContext.__function_name,
    module: _module,
    exports: _module.exports,
    console: fConsole,
    requireFunc: FunctionModule.require,
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
    fromModule: [...fromModule],
  }
  sandbox.global = sandbox
  return sandbox
}
