import dotenv from 'dotenv'

dotenv.config()

export default class Config {
  static get DB_URI() {
    return process.env['DB_URI'] || ''
  }

  /**
   * the logger level : 'fatal', 'error', 'warning', 'info', 'debug', 'trace'
   */
  static get LOG_LEVEL():
    | 'fatal'
    | 'error'
    | 'warning'
    | 'info'
    | 'debug'
    | 'trace' {
    return (process.env['LOG_LEVEL'] as any) ?? (this.isProd ? 'info' : 'debug')
  }

  /**
   * in production deploy or not
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }

  /**
   * the serving port, default is 5060
   */
  static get PORT(): number {
    return (process.env.PORT ?? 5060) as number
  }

  static get LOG_CAP(): number {
    return (process.env.LOG_CAP ?? 10000) as number
  }

  static get LOG_SIZE(): number {
    return (process.env.LOG_SIZE ?? 10 * 1024 * 1024) as number // 10 MB
  }

  static get JWT_SECRET(): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }
    return process.env.JWT_SECRET
  }
}
