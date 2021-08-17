import * as path from 'path'
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
   * the mongodb connection configuration of app db
   */
  static get app_db() {
    if (!process.env['APP_DB']) {
      throw new Error('env: `APP_DB` is missing')
    }

    if (!process.env['APP_DB_URI']) {
      throw new Error('env: `APP_DB_URI` is missing')
    }

    return {
      database: process.env['APP_DB'],
      uri: process.env['APP_DB_URI'],
      poolSize: (process.env['APP_DB_POOL_LIMIT'] ?? 100) as number,
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
   * the app server secret salt, mainly used for generating app tokens
   */
  static get APP_SERVER_SECRET_SALT(): string {
    const secret_salt = process.env['APP_SERVER_SECRET_SALT']
    if (!secret_salt) {
      throw new Error('env: `APP_SERVER_SECRET_SALT` is missing')
    }
    return secret_salt
  }

  /**
   * username of the first initializing admin
   */
  static get SYS_ADMIN(): string {
    if (!process.env['SYS_ADMIN']) {
      throw new Error('env: `SYS_ADMIN` is missing')
    }

    return process.env['SYS_ADMIN']
  }

  /**
   * password of the first initializing admin
   */
  static get SYS_ADMIN_PASSWORD(): string {
    if (!process.env['SYS_ADMIN_PASSWORD']) {
      throw new Error('env: `SYS_ADMIN_PASSWORD` is missing')
    }
    return process.env['SYS_ADMIN_PASSWORD']
  }

  /**
   * the `temp path`
   */
  static get TMP_PATH(): string {
    const tmp_path = process.env['TMP_PATH'] ?? path.join(process.cwd(), "tmp")
    return tmp_path
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