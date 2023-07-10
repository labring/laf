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

  static get RUNTIME_IMAGE(): string {
    return process.env.RUNTIME_IMAGE
  }

  static get RUNTIME_VERSION(): string {
    return require('../package.json')?.version
  }

  static get APPID(): string {
    return process.env.APPID ?? process.env.APP_ID
  }

  static get NPM_INSTALL_FLAGS(): string {
    return process.env.NPM_INSTALL_FLAGS || ''
  }

  static get REQUEST_LIMIT_SIZE(): string {
    return process.env.REQUEST_LIMIT_SIZE || '10mb'
  }

  static get LOG_SERVER_URL(): string { 
    return process.env.LOG_SERVER_URL || ''
  }

  static get LOG_SERVER_TOKEN(): string { 
    return process.env.LOG_SERVER_TOKEN || ''
  }
}
