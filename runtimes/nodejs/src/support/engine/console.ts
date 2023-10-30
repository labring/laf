import * as util from 'util'
import * as moment from 'moment'


export class Console {

  _log(...params: any[]): void {
    const now = moment?.default().format('YYYY-MM-DD HH:mm:ss.SSS Z')
    const content = params
      .map((param) => {
        return util.inspect(param, { depth: 30 })
      })
      .join(' ')
    console.log(now + ' ' + content)
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

  private _logs: string[] = []

  _log(...params: any[]): void {
    const now = moment?.default().format('YYYY-MM-DD HH:mm:ss.SSS Z')
    const content = params
      .map((param) => {
        return util.inspect(param, { depth: 30 })
      })
      .join(' ')

    this._logs.push(now + ' ' + content)
  }
  
  getLogs() {
    return JSON.stringify(this._logs)
  }

}

