import * as util from 'util'
import * as dayjs from 'dayjs'

export class FunctionConsole {
  private _logs: any[] = []

  get logs() {
    return this._logs
  }

  log(...params: any[]) {
    const date = dayjs().format("YYYY/MM/DD HH:mm:ss")
    const r = util.format("[%s] -", date, ...params)
    this._logs.push(r)
  }

  error(...params: any[]) {
    const date = dayjs().format("YYYY/MM/DD HH:mm:ss")
    const r = util.format("[%s] -", date, ...params)
    this._logs.push(r)
  }
}