import * as util from 'util'

export class FunctionConsole {
  requestId: string = ''

  static write: (message: string, requestId: string) => void = console.log

  constructor(requestId: string) {
    this.requestId = requestId
  }

  private _log(...params: any[]) {
    const content = params
      .map((param) => {
        return util.inspect(param, { depth: 30 })
      })
      .join(' ')

    FunctionConsole.write(content, this.requestId)
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
