import * as util from 'util'
import dayjs from 'dayjs'
import chalk from 'chalk'
import { padStart} from 'lodash'

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Console {

  category: string

  constructor(category: string) {
    this.category = category
  }

  protected _format(level: LogLevel, ...params: any[]): string {
    const time = chalk.gray(dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'))
    const levelStr = this._colorize(level, padStart(level, 5, ' '))
    const fn = chalk.blue(`[${this.category}]`)

    let content = params
    .map((param) => {
      if (typeof param === 'string') return this._colorize(level, param)
      return this._colorize(level, util.inspect(param, { depth: 1, colors: true }))
    })
    .join(' ')

    // content = this._colorize(level, content)
    const data = `${time} ${levelStr} ${fn} ${content}`
    return data
  }

  debug(...params: any[]) {
    const data = this._format(LogLevel.DEBUG, ...params)
    console.debug(data)
  }

  info(...params: any[]) {
    const data = this._format(LogLevel.INFO, ...params)
    console.info(data)
  }

  log(...params: any[]) {
    const data = this._format(LogLevel.INFO, ...params)
    console.log(data)
  }

  warn(...params: any[]) {
    const data = this._format(LogLevel.WARN, ...params)
    console.warn(data)
  }

  error(...params: any[]) {
    const data = this._format(LogLevel.ERROR, ...params)
    console.error(data)
  }

  protected _colorize(level: LogLevel, data: any) {
    let result = data
    switch (level) {
      case LogLevel.DEBUG:
        result = chalk.gray(data)
        break
      case LogLevel.INFO:
        result = chalk.green(data)
        break
      case LogLevel.WARN:
        result = chalk.yellow(data)
        break
      case LogLevel.ERROR:
        result = chalk.red(data)
        break
      default:
        result = data
        break
    }
    return result
  }

}

export class DebugConsole extends Console {
  constructor(category: string) {
    super(category)
  }

  private _logs: string[] = []

  protected _format(level: LogLevel, ...params: any[]): string {
    const data = super._format(level, ...params)
    this._logs.push(data)
    return data
  }

  getLogs() {
    return JSON.stringify(this._logs)
  }
}
