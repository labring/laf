import * as vm from 'vm'
import { FunctionConsole } from './console'
import { FunctionResult, IncomingContext, RequireFuncType, RuntimeContext } from './types'

const require_func: RequireFuncType = (module): any => {
  const supported = ['crypto', 'path', 'querystring', 'url', 'lodash', 'moment']
  if (supported.includes(module)) { return require(module) as any }
  return undefined
}

export class FunctionEngine {

  async run(code: string, incomingCtx: IncomingContext): Promise<FunctionResult> {

    const requestId = incomingCtx.requestId
    const fconsole = new FunctionConsole()
    const wrapped = `${code}; __runtime_promise = exports.main(ctx)`

    const _module = {
      exports: {}
    }
    const sandbox: RuntimeContext = {
      ctx: {
        query: incomingCtx.query,
        body: incomingCtx.body,
        auth: incomingCtx.auth,
        requestId: requestId,
      },
      module: _module,
      exports: module.exports,
      __runtime_promise: null,
      console: fconsole,
      less: incomingCtx.less,
      require: require_func,
      Buffer: Buffer
    }
    try {
      const script = new vm.Script(wrapped)
      script.runInNewContext(sandbox)
      const data = await sandbox.__runtime_promise

      return {
        data,
        logs: fconsole.logs
      }
    } catch (error) {
      fconsole.log(error.message)
      fconsole.log(error.stack)
      return {
        error: error,
        logs: fconsole.logs
      }
    }
  }
}