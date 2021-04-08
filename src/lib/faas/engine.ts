import * as vm from 'vm'
import * as util from 'util'
import * as moment from 'moment'


interface RuntimeContext {
  ctx: FunctionContext,
  module: { exports: Object },
  exports: Object,
  promise: any,
  console: FunctionConsole,
  less: any
}

interface FunctionContext {
  query?: any,
  body?: any,
  auth?: any,
  requestId: string
}

export interface IncomingContext extends FunctionContext {
  functionName: string,
  requestId: string,
  less?: any
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
        requestId: requestId
      },
      module: _module,
      exports: module.exports,
      promise: null,
      console: fconsole,
      less: incomingCtx.less
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