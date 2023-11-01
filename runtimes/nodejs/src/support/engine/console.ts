import * as util from 'util'
import dayjs from 'dayjs'

export class Console {
  functionName: string

  constructor(functionName: string) {
    this.functionName = functionName
  }

  _log(...params: any[]): void {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
    const content = params
      .map((param) => {
        return util.inspect(param, { depth: 1 })
      })
      .join(' ')
    
    const data = `[${now}] [${this.functionName}] ${content}`
    console.log(data)
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
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
    const content = params
      .map((param) => {
        return util.inspect(param, { depth: 1 })
      })
      .join(' ')

    const data = `[${now}] [${this.functionName}] ${content}`
    this._logs.push(data)
    console.log(data)
  }

  getLogs() {
    return JSON.stringify(this._logs)
  }
}
