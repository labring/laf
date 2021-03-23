import * as vm from 'vm'
import * as util from 'util'
import * as moment from 'moment'

interface RuntimeContext {
  ctx: FunctionContext,
  promise: any,
  console: FunctionConsole,
  requestId: string,
  less: any
}

interface FunctionContext {
  params?: any,
  auth?: any,
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
    const wrapped = `func = ${code}; promise = func(ctx)`

    const sandbox: RuntimeContext = {
      ctx: {
        params: incomingCtx.params,
        auth: incomingCtx.auth,
      },
      promise: null,
      console: fconsole,
      requestId: requestId,
      less: incomingCtx.less
    }
    try {
      fconsole.log(requestId)
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