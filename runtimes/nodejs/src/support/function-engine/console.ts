import * as util from 'util'
import { FunctionContext } from './types'

export class FunctionConsole {
  ctx: FunctionContext

  static write: (message: string, ctx: FunctionContext) => void = console.log

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
