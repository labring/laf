import * as util from 'util'
import * as dayjs from 'dayjs'

export class FunctionConsole {
  private _logs: string[] = []

  get logs() {
    return this._logs
  }

  private _log(...params: any[]) {
    const date = dayjs().format("YYYY/MM/DD HH:mm:ss")
    const r = util.format("[%s] -", date, ...params)
    this._logs.push(r)
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
