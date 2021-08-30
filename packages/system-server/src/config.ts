import * as dotenv from 'dotenv'
dotenv.config()

/**
 * Configuration Collection
 */
export default class Config {
  /**
   * the mongodb connection configuration of sys db
   */
  static get sys_db() {
    if (!process.env['SYS_DB']) {
      throw new Error('env: `SYS_DB` is missing')
    }

    if (!process.env['SYS_DB_URI']) {
      throw new Error('env: `SYS_DB_URI` is missing')
    }

    return {
      database: process.env['SYS_DB'],
      uri: process.env['SYS_DB_URI'],
      poolSize: (process.env['SYS_DB_POOL_LIMIT'] ?? 10) as number,
    }
  }

  /**
   * the devops server secret salt, mainly used for generating devops tokens
   */
  static get SYS_SERVER_SECRET_SALT(): string {
    const secret_salt = process.env['SYS_SERVER_SECRET_SALT']
    if (!secret_salt) {
      throw new Error('env: `SYS_SERVER_SECRET_SALT` is missing')
    }
    return secret_salt
  }

  /**
   * the logger level : 'fatal', 'error', 'warning', 'info', 'debug', 'trace'
   */
  static get LOG_LEVEL(): string {
    return process.env['LOG_LEVEL'] ?? (this.isProd ? 'info' : 'debug')
  }

  /**
   * the serving port, default is 9000
   */
  static get PORT(): number {
    return (process.env.PORT ?? 9000) as number
  }

  /**
   * the expiration duration time of devops server token, default is 24 hours (units in hour)
   */
  static get TOKEN_EXPIRED_TIME(): number {
    return (process.env.TOKEN_EXPIRED_TIME ?? 24) as number
  }

  /**
   * in production deploy or not
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }
}