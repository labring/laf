import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Configuration Collection
 */
export default class Config {

  /**
   * scheduler loop interval, in ms
   */
  static get SCHEDULER_INTERVAL(): number {
    const value = process.env.SCHEDULER_INTERVAL || '1000'
    return parseInt(value)
  }

  /**
   * the mongodb connection configuration of sys db
   */
  static get SYS_DB_URI() {
    if (!process.env['SYS_DB_URI']) {
      throw new Error('env: `SYS_DB_URI` is missing')
    }

    return process.env['SYS_DB_URI']
  }

  /**
   * the mongodb connection configuration of apps' db, use for creating app databases;
   */
  static get APP_DB_URI() {
    if (!process.env['APP_DB_URI']) {
      throw new Error('env: `APP_DB_URI` is missing')
    }
    return process.env['APP_DB_URI']
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
    return (process.env.PORT ?? 9001) as number
  }

  /**
   * in production deploy or not
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }

  /**
   * 网关类型
   */
  static get GATEWAY_TYPE(): string {
    return process.env['GATEWAY_TYPE'] || 'apisix'
  }

  /**
   * 网关密钥
   */
  static get API_SIX_KEY(): string {
    if (this.GATEWAY_TYPE === 'apisix' && !process.env['API_SIX_KEY']) {
      throw new Error('env: `API_SIX_KEY` is missing')
    }
    return process.env.API_SIX_KEY
  }

  /**
   * The app service runtime platform: 'docker' | 'kubernetes'
   */
  static get SERVICE_DRIVER(): string {
    return process.env.SERVICE_DRIVER || 'docker'
  }

  /**
   * deploy domain
   */
  static get DEPLOY_DOMAIN(): string {
    if (!process.env['DEPLOY_DOMAIN']) {
      throw new Error('env: `DEPLOY_DOMAIN` is missing')
    }
    return process.env['DEPLOY_DOMAIN']
  }

  /**
   * system client host
   */
  static get SYS_CLIENT_HOST(): string {
    if (!process.env['SYS_CLIENT_HOST']) {
      throw new Error('env: `SYS_CLIENT_HOST` is missing')
    }
    return process.env['SYS_CLIENT_HOST']
  }

  /**
   * deploy oss domain
   */
  static get DEPLOY_OSS_DOMAIN(): string {
    if (!process.env['DEPLOY_OSS_DOMAIN']) {
      throw new Error('env: `DEPLOY_OSS_DOMAIN` is missing')
    }
    return process.env['DEPLOY_OSS_DOMAIN']
  }

  /**
   * The schema of app deployed url: `http` | `https`.
   * Default value is `http`.
   */
  static get APP_SERVICE_DEPLOY_URL_SCHEMA(): string {
    return process.env.APP_SERVICE_DEPLOY_URL_SCHEMA ?? 'http'
  }


}