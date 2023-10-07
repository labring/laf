import { FunctionContext, RequireFuncType } from './types'
import { FunctionVm } from './vm'

const defaultRequireFunction: RequireFuncType = (module): any => {
  return require(module) as any
}

export class FunctionRequire {
  requireFunc: RequireFuncType
  fromModules: string[]

  constructor(requireFunc?: RequireFuncType, fromModules?: string[]) {
    this.requireFunc = requireFunc ?? defaultRequireFunction
    this.fromModules = fromModules ?? []
  }

  /**
   * load cloud funcion as module
   * @param name
   * @param code
   * @returns
   */
  load(
    name: string,
    code: string,
    fromModules: string[],
    ctx: FunctionContext,
  ): any {
    const context = {
      ...ctx,
      __function_name: name,
      __isRequired: true,
    }

    const sandbox = FunctionVm.buildSandbox(
      context,
      this.requireFunc,
      fromModules,
    )
    const wrapped = this.warp(code)
    const script = FunctionVm.createVM(wrapped, {})
    return script.runInNewContext(sandbox, {})
  }

  /**
   * warp function code
   * @param code
   * @returns
   */
  warp(code: string): string {
    return `
    const require = (module) => {
      fromModules.push(__filename)
      return requireFunc(module, fromModules, __context__)
    }
    const exports = {};
    ${code}
    exports;
    `
  }
}
