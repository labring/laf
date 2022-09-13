import * as assert from 'assert'
import * as dotenv from 'dotenv'
import { URL } from 'url'
dotenv.config()

/**
 * Configuration Collection
 */
export default class Config {
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
   * the logger level : 'fatal', 'error', 'warning', 'info', 'debug', 'trace'
   */
  static get DB_LOG_LEVEL(): string {
    return process.env['DB_LOG_LEVEL'] ?? (this.isProd ? 'warning' : 'debug')
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
   * the app service image name
   */
  static get APP_SERVICE_IMAGE(): string {
    return process.env.APP_SERVICE_IMAGE
  }

  /**
   * The application count that an account can create by default
   */
  static get ACCOUNT_DEFAULT_APP_QUOTA(): number {
    const value = process.env.ACCOUNT_DEFAULT_APP_QUOTA ?? 2
    return Number(value)
  }

  /**
   * Account registration mode
   * 0(Default): Unlimited registration
   * 1: Prohibit registration
   */
  static get ACCOUNT_SIGNUP_MODE(): number {
    const value = process.env.ACCOUNT_SIGNUP_MODE ?? 0
    return Number(value)
  }

  /**
   * The host to access the app service
   * For example, if set this to `lafyun.com`, then you can access app service by format `[appid].lafyun.com`:
   * - 7b0b318c-b96c-4cc5-b521-33d11bd16cde.lafyun.com
   * - http://7b0b318c-b96c-4cc5-b521-33d11bd16cde.lafyun.com/file/public/33d11bd16cde.png
   * - http://7b0b318c-b96c-4cc5-b521-33d11bd16cde.lafyun.com/FUNC_NAME
   *
   * You should resolve `*.lafyun.com` to your laf server ip, to support `[appid].lafyun.com` url.
   * You can also provide the PORT, like `lafyun.com:8080`.
   */
  static get APP_SERVICE_DEPLOY_HOST(): string {
    return process.env.APP_SERVICE_DEPLOY_HOST ?? ''
  }



  static get PUBLISH_PORT(): string {
    return process.env.PUBLISH_PORT ?? ''
  }

  static get PUBLISH_HTTPS_PORT(): string {
    return process.env.PUBLISH_HTTPS_PORT ?? ''
  }

  /**
   * The schema of app deployed url: `http` | `https`.
   * Default value is `http`.
   */
  static get APP_SERVICE_DEPLOY_URL_SCHEMA(): string {
    return process.env.APP_SERVICE_DEPLOY_URL_SCHEMA ?? 'http'
  }

  /**
   * Minio configuration
   */
  static get MINIO_CONFIG() {
    const access_key: string = process.env.MINIO_ACCESS_KEY
    const access_secret: string = process.env.MINIO_ACCESS_SECRET

    // use URL().origin to get the pure hostname, because the hostname may contain port number 
    // this is to resolve bug of https://github.com/labring/laf/issues/96
    const internal_endpoint: string = new URL(process.env.MINIO_INTERNAL_ENDPOINT).origin
    const external_endpoint: string = new URL(process.env.MINIO_EXTERNAL_ENDPOINT).origin
    
    // fixed external_endpoint with extra schema and port config
    const external_port = process.env.APP_SERVICE_DEPLOY_URL_SCHEMA === 'https' ? process.env.PUBLISH_HTTPS_PORT : process.env.PUBLISH_PORT 
    const obj = new URL(external_endpoint)
    obj.port = external_port || obj.port
    obj.protocol = process.env.APP_SERVICE_DEPLOY_URL_SCHEMA
    const fixed_external_endpoint = obj.toString()

    const region: string = process.env.MINIO_REGION_NAME

    return {
      access_key,
      access_secret,
      endpoint: {
        internal: internal_endpoint.replace(/\/$/, ''),
        external: fixed_external_endpoint.replace(/\/$/, '')
      },
      user_policy: process.env.MINIO_USER_POLICY || 'owner_by_prefix',
      region
    }
  }

  static get INIT_ROOT_ACCOUNT() {
    const account: string = process.env.INIT_ROOT_ACCOUNT || 'root'
    return account
  }

  static get INIT_ROOT_ACCOUNT_PASSWORD() {
    const password: string = process.env.INIT_ROOT_ACCOUNT_PASSWORD
    if (!password) {
      throw new Error('env: `INIT_ROOT_ACCOUNT_PASSWORD` is missing')
    }
    return password
  }

  /**
   * length of appid genereated, deafult value is 6
   */
  static get APPID_LENGTH(): number {
    const size = parseInt(process.env.APPID_LENGTH || '6')
    assert.ok(size >= 3, 'appid length must great or equal than 3')
    assert.ok(size <= 32, 'appid length must less or equal than 32')

    return size
  }

  static get SYSTEM_EXTENSION_APPID(): string {
    return process.env.SYSTEM_EXTENSION_APPID || '000000'
  }
}