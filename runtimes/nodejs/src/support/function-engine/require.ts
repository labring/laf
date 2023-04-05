import { RequireFuncType } from './types'
import { FunctionVm } from './vm'

const defaultRequireFunction: RequireFuncType = (module): any => {
  return require(module) as any
}

export class FunctionRequire {
  requireFunc: RequireFuncType

  constructor(requireFunc?: RequireFuncType) {
    this.requireFunc = requireFunc ?? defaultRequireFunction
  }

  /**
   * load cloud funcion as module
   * @param name
   * @param code
   * @returns
   */
  load(name: string, code: string): any {
    const context = {
      __function_name: name,
      requestId: '',
    }

    const sandbox = FunctionVm.buildSandbox(context, this.requireFunc)
    const wrapped = this.warp(code)
    try {
      const script = FunctionVm.createVM(wrapped, {})
      return script.runInNewContext(sandbox, {})
    } catch (error) {
      console.log(error.message, error.stack)
      return null
    }
  }

  /**
   * warp function code
   * @param code
   * @returns
   */
  warp(code: string): string {
    return `
    const exports = {};
    ${code}
    exports;
    `
  }
}
