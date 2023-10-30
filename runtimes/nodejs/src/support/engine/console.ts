import * as util from 'util'
import dayjs from 'dayjs'

export class Console {
  functionName: string

  constructor(functionName: string) {
    this.functionName = functionName
  }

  _log(...params: any[]): void {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS Z')
    const content = params
      .map((param) => {
        return util.inspect(param, { depth: 30 })
      })
      .join(' ')
    console.log(now + ' ' + this.functionName + ' ' + content)
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
}

export class DebugConsole extends Console {
  constructor(functionName: string) {
    super(functionName)
  }

  private _logs: string[] = []

  _log(...params: any[]): void {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS Z')
    const content = params
      .map((param) => {
        return util.inspect(param, { depth: 30 })
      })
      .join(' ')

    this._logs.push(now + ' ' + this.functionName + ' ' + content)
    console.log(now + ' ' + this.functionName + ' ' + content)
  }

  getLogs() {
    return JSON.stringify(this._logs)
  }
}
