import * as dotenv from 'dotenv'
dotenv.config()

/**
 * Configuration Collection
 */
export default class Config {
  /**
   * the mongodb connection configuration of sys db
   */
  static get sys_db_uri() {
    if (!process.env['SYS_DB_URI']) {
      throw new Error('env: `SYS_DB_URI` is missing')
    }

    return process.env['SYS_DB_URI']
  }

  /**
   * the mongodb connection configuration of apps' db, use for creating app databases;
   */
  static get app_db_uri() {
    if (!process.env['APP_DB_URI']) {
      throw new Error('env: `APP_DB_URI` is missing')
    }
    return process.env['APP_DB_URI']
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

  /**
   * the name of network which apps used
   */
  static get SHARED_NETWORK(): string {
    return process.env.SHARED_NETWORK ?? 'laf_shared_network'
  }

  /**
   * the app service image name
   */
  static get APP_SERVICE_IMAGE(): string {
    return process.env.APP_SERVICE_IMAGE
  }

  /**
   * The application count that an account can create by default
   */
  static get ACCOUNT_DEFAULT_APP_QUOTA(): number {
    return (process.env.ACCOUNT_DEFAULT_APP_QUOTA ?? 2) as number
  }

  /**
   * The deploy url used to access the app service
   * example: http://www.example.com:8080 , don't end with '/'
   */
  static get APP_DEPLOY_URL(): string {
    return process.env.APP_DEPLOY_URL ?? ''
  }
}