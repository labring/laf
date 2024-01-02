import dotenv from 'dotenv'

dotenv.config()

export default class Config {
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
   * the serving port, default is 2342
   */
  static get PORT(): number {
    return (process.env.PORT ?? 2342) as number
  }

  static get KUBECONF(): string {
    return process.env.KUBECONF || ''
  }

  static get NAMESPACE(): string {
    return process.env.NAMESPACE || ''
  }
  static get DB_NAMESPACE(): string {
    return process.env.DB_NAMESPACE || ''
  }

  static get API_SECRET(): string {
    if (!process.env.API_SECRET) {
      throw new Error('API_SECRET is not defined')
    }
    return process.env.API_SECRET
  }
}
