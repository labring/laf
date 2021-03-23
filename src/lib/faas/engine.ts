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

    const functionConsole = new FunctionConsole()
    const wrapped = `func = ${code}; promise = func(ctx)`

    const sandbox: RuntimeContext = {
      ctx: {
        params: incomingCtx.params,
        auth: incomingCtx.auth,
      },
      promise: null,
      console: functionConsole,
      requestId: incomingCtx.requestId,
      less: incomingCtx.less
    }
    try {
      const script = new vm.Script(wrapped)
      script.runInNewContext(sandbox)
      const data = await sandbox.promise

      return {
        data,
        logs: functionConsole.logs
      }
    } catch (error) {
      functionConsole.logs.push(error.message)
      functionConsole.logs.push(error.stack)
      return {
        error: error,
        logs: functionConsole.logs
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