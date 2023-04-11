import * as dotenv from 'dotenv'

/**
 * parse environment vars from the `.env` file if existing
 */
dotenv.config()

/**
 * configuration management
 */
export default class Config {
  /**
   * mongodb connection configuration
   */
  static get DB_URI() {
    if (!process.env['DB_URI']) {
      throw new Error('env: `DB_URI` is missing')
    }
    return process.env['DB_URI']
  }

  /**
   * the server secret salt, mainly used for generating tokens
   */
  static get SERVER_SECRET(): string {
    const secret_salt = process.env['SERVER_SECRET']
    if (!secret_salt) {
      throw new Error('env: `SERVER_SECRET` is missing')
    }
    return secret_salt
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
   * the serving port, default is 8000
   */
  static get PORT(): number {
    return (process.env.PORT ?? 8000) as number
  }

  /**
   * in production deploy or not
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }

  /**
   * Expired time of function logs, in seconds
   */
  static get FUNCTION_LOG_EXPIRED_TIME(): number {
    return (process.env.FUNCTION_LOG_EXPIRED_TIME ?? 3600 * 24 * 3) as number
  }

  static get RUNTIME_IMAGE(): string {
    return process.env.RUNTIME_IMAGE
  }

  static get RUNTIME_VERSION(): string {
    return require('../package.json')?.version
  }

  static get APP_ID(): string {
    return process.env.APP_ID
  }

  static get NPM_INSTALL_FLAGS(): string {
    return process.env.NPM_INSTALL_FLAGS || ''
  }

  static get REQUEST_LIMIT_SIZE(): string {
    return process.env.REQUEST_LIMIT_SIZE || '10mb'
  }

  static get PACKAGES(): string {
    return process.env.PACKAGES || ''
  }
}
