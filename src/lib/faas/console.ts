import * as util from 'util'
import * as moment from 'moment'

export class FunctionConsole {
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