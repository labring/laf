
export interface LoggerInterface {
  level: number
  trace(...params: any[]): void
  debug(...params: any[]): void
  info(...params: any[]): void
  warn(...params: any[]): void
  error(...params: any[]): void
  fatal(...params: any[]): void
}


export class DefaultLogger implements LoggerInterface {
  level: number
  constructor(level?: number) {
    this.level = level ?? 3
  }
  trace(...params: any[]): void {
    if (this.level >= 6)
      console.trace(...params)
  }
  debug(...params: any[]): void {
    if (this.level >= 5)
      console.debug(...params)
  }
  info(...params: any[]): void {
    if (this.level >= 4)
      console.info(...params)
  }
  warn(...params: any[]): void {
    if (this.level >= 3)
      console.warn(...params)
  }
  error(...params: any[]): void {
    if (this.level >= 2)
      console.error(...params)
  }
  fatal(...params: any[]): void {
    if (this.level >= 1)
      console.error(...params)
  }

}