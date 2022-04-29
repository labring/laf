import * as dotenv from 'dotenv'
dotenv.config()

/**
 * Configuration Collection
 */
export default class Config {

  /**
   * scheduler loop interval
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
    return (process.env.PORT ?? 9000) as number
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
  static get DOCKER_SHARED_NETWORK(): string {
    return process.env.DOCKER_SHARED_NETWORK || process.env.SHARED_NETWORK || 'laf_shared_network'
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

  static get KUBE_NAMESPACE_OF_APP_SERVICES() {
    return process.env.KUBE_NAMESPACE_OF_APP_SERVICES || 'laf'
  }

  static get KUBE_NAMESPACE_OF_SYS_SERVICES() {
    return process.env.KUBE_NAMESPACE_OF_SYS_SERVICES || 'laf'
  }

  static get APP_SERVICE_ENV_NPM_INSTALL_FLAGS(): string {
    return process.env.APP_SERVICE_ENV_NPM_INSTALL_FLAGS || ''
  }

  static get SYSTEM_EXTENSION_APPID(): string {
    return process.env.SYSTEM_EXTENSION_APPID || '0000000000000000'
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
    const internal_endpoint: string = process.env.MINIO_INTERNAL_ENDPOINT
    const external_endpoint: string = process.env.MINIO_EXTERNAL_ENDPOINT
    const region: string = process.env.MINIO_REGION_NAME
    return {
      access_key,
      access_secret,
      endpoint: {
        internal: internal_endpoint,
        external: external_endpoint
      },
      user_policy: process.env.MINIO_USER_POLICY || 'owner_by_prefix',
      region
    }
  }
}