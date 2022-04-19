import * as dotenv from 'dotenv'
import * as path from 'path'
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
    const value = process.env.ACCOUNT_DEFAULT_APP_QUOTA ?? 2
    return Number(value)
  }

  /**
   * The host to access the app service
   * For example, if set this to `lafyun.com`, then you can access app service by format `[appid].lafyun.com`: 
   * - 7b0b318c-b96c-4cc5-b521-33d11bd16cde.lafyun.com
   * - http://7b0b318c-b96c-4cc5-b521-33d11bd16cde.lafyun.com/file/public/33d11bd16cde.png
   * - http://7b0b318c-b96c-4cc5-b521-33d11bd16cde.lafyun.com/func/FUNC_NAME
   * 
   * You should resolve `*.lafyun.com` to your laf server ip, to support `[appid].lafyun.com` url.
   * You can also provide the PORT, like `lafyun.com:8080`. 
   */
  static get APP_SERVICE_DEPLOY_HOST(): string {
    return process.env.APP_SERVICE_DEPLOY_HOST ?? ''
  }

  /**
   * The schema of app deployed url: `http` | `https`.
   * Default value is `http`.
   */
  static get APP_SERVICE_DEPLOY_URL_SCHEMA(): string {
    return process.env.APP_SERVICE_DEPLOY_URL_SCHEMA ?? 'http'
  }

  /**
   * The resources (cpu & memory) limit of application service. 
   */
  static get APP_DEFAULT_RESOURCES(): { req_cpu: string, req_memory: string, limit_cpu: string, limit_memory: string } {
    const limit_cpu = process.env.APP_SERVICE_DEFAULT_LIMIT_CPU ?? '100'
    const limit_memory = process.env.APP_SERVICE_DEFAULT_LIMIT_MEMORY || '256'

    return {
      req_cpu: process.env.APP_SERVICE_DEFAULT_REQUEST_CPU ?? limit_cpu,
      req_memory: process.env.APP_SERVICE_DEFAULT_REQUEST_MEMORY ?? limit_memory,
      limit_cpu,
      limit_memory,
    }
  }

  /**
   * DEBUG: the app-service path that bind to app-service container
   * This env var should only be set while debugging app service, 
   * otherwise always keep this env var value be empty
   */
  static get DEBUG_BIND_HOST_APP_PATH(): string | undefined {
    return process.env.DEBUG_BIND_HOST_APP_PATH ?? undefined
  }

  /**
   * The app service runtime platform: 'docker' | 'kubernetes'
   */
  static get SERVICE_DRIVER(): string {
    return process.env.SERVICE_DRIVER || 'docker'
  }

  /**
   * Minio configuration
   */
  static get MINIO_CONFIG() {
    const access_key: string = process.env.MINIO_ACCESS_KEY
    const access_secret: string = process.env.MINIO_ACCESS_SECRET
    const internal_endpoint: string = process.env.MINIO_INTERNAL_ENDPOINT
    const external_endpoint: string = process.env.MINIO_EXTERNAL_ENDPOINT
    return {
      access_key,
      access_secret,
      endpoint: {
        internal: internal_endpoint,
        external: external_endpoint
      },
      user_policy: process.env.MINIO_USER_POLICY || 'owner_by_prefix'
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

  static get SYSTEM_EXTENSION_SERVER_APP_PACKAGE() {
    const default_ = path.resolve(__dirname, '../extension/system-extension-server.lapp')
    const package_: string = process.env.SYSTEM_EXTENSION_SERVER_APP_PACKAGE || default_
    return package_
  }

  static get KUBE_NAMESPACE_OF_APP_SERVICES() {
    return process.env.KUBE_NAMESPACE_OF_APP_SERVICES || 'laf'
  }

  static get KUBE_NAMESPACE_OF_SYS_SERVICES() {
    return process.env.KUBE_NAMESPACE_OF_SYS_SERVICES || 'laf'
  }

  static get APP_SERVICE_ENV_NPM_INSTALL_FLAGS(): string {
    return process.env.APP_SERVICE_ENV_NPM_INSTALL_FLAGS || ''
  }
}