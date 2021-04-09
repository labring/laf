import * as vm from 'vm'
import * as util from 'util'
import * as moment from 'moment'
import { LessInterface } from '../types'

// require function
export type RequireFuncType = (module: 'crypto' | 'path' | 'querystring' | 'url' | 'lodash' | 'moment') => any

const require_func: RequireFuncType = (module): any => {
  const supported = ['crypto', 'path', 'querystring', 'url', 'lodash', 'moment']
  if (supported.includes(module)) { return require(module) as any }
  return undefined
}


// vm run context (global)
export interface RuntimeContext {
  ctx: FunctionContext,
  module: { exports: Object },
  exports: Object,
  promise: any,
  console: FunctionConsole,
  less: LessInterface,
  require: RequireFuncType,
  Buffer: typeof Buffer
}

// ctx passed to function
interface FunctionContext {
  query?: any,
  body?: any,
  auth?: any,
  requestId: string
}

// param for engine.run()
export interface IncomingContext extends FunctionContext {
  functionName: string,
  requestId: string,
  less?: LessInterface
}

interface FunctionResult {
  data?: any,
  logs: any[],
  error?: any
}

export class FunctionEngine {
  async run(code: string, incomingCtx: IncomingContext): Promise<FunctionResult> {

    const requestId = incomingCtx.requestId
    const fconsole = new FunctionConsole()
    const wrapped = `${code}; promise = exports.main(ctx)`

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
      promise: null,
      console: fconsole,
      less: incomingCtx.less,
      require: require_func,
      Buffer: Buffer
    }
    try {
      const script = new vm.Script(wrapped)
      script.runInNewContext(sandbox)
      const data = await sandbox.promise

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


class FunctionConsole {
  private _logs: any[] = []

  get logs() {
    return this._logs
  }

  log(...params) {
    const date = moment().format("YYYY/MM/DD HH:mm:ss")
    const r = util.format("[%s] -", date, ...params)
    this._logs.push(r)
  }
}