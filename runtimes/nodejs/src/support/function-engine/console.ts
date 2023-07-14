import * as util from 'util'
import { FunctionContext } from './types'
import Config from '../../config'
import axios from 'axios'

export class FunctionConsole {
  ctx: FunctionContext

  static write(message: string, ctx: FunctionContext) {
    if (!Config.LOG_SERVER_URL || !Config.LOG_SERVER_TOKEN) return

    const doc = {
      request_id: ctx.requestId,
      func: ctx.__function_name,
      data: message,
      created_at: new Date(),
    }

    axios.post(`${Config.LOG_SERVER_URL}/function/log`, {
      appid: Config.APPID,
      log: doc,
    }, {
      headers: {
        'x-token': Config.LOG_SERVER_TOKEN
      }
    })
  }

  constructor(ctx: FunctionContext) {
    this.ctx = ctx
  }

  private _log(...params: any[]) {
    const content = params
      .map((param) => {
        return util.inspect(param, { depth: 30 })
      })
      .join(' ')

    FunctionConsole.write(content, this.ctx)
  }

  debug(...params: any[]) {
    this._log(...params)
  }

  info(...params: any[]) {
    this._log(...params)
  }

  log(...params: any[]) {
    this._log(...params)
  }

  warn(...params: any[]) {
    this._log(...params)
  }

  error(...params: any[]) {
    this._log(...params)
  }
}
