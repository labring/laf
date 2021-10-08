import * as path from 'path'
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
  static get SERVER_SECRET_SALT(): string {
    const secret_salt = process.env['SERVER_SECRET_SALT'] ?? process.env['SERVER_SALT']
    if (!secret_salt) {
      throw new Error('env: `SERVER_SECRET_SALT` is missing')
    }
    return secret_salt
  }

  /**
   * the root path of local file system driver, only used while `FILE_SYSTEM_DRIVER` equals to 'local'
   */
  static get LOCAL_STORAGE_ROOT_PATH(): string {
    return process.env['LOCAL_STORAGE_ROOT_PATH'] ?? path.join(process.cwd(), "data")
  }

  /**
   * the file system driver: 'localfs', 'gridfs'
   */
  static get FILE_SYSTEM_DRIVER(): 'gridfs' | 'localfs' {
    return process.env['FILE_SYSTEM_DRIVER'] as any ?? 'gridfs'
  }

  /**
   * if enable the unauthorized upload operation in `public` bucket: 'on' | 'off'.
   * default is 'on'
   */
  static get FILE_SYSTEM_ENABLE_UNAUTHORIZED_UPLOAD(): 'on' | 'off' {
    return process.env['FILE_SYSTEM_ENABLE_UNAUTHORIZED_UPLOAD'] as any ?? 'on'
  }

  /**
   * value of HTTP header Cache-Control: max-age=120 while download file
   */
  static get FILE_SYSTEM_HTTP_CACHE_CONTROL(): string {
    return process.env['FILE_SYSTEM_HTTP_CACHE_CONTROL']
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
  static get LOG_LEVEL(): 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' {
    return process.env['LOG_LEVEL'] as any ?? (this.isProd ? 'info' : 'debug')
  }

  /**
   * the serving port, default is 8000
   */
  static get PORT(): number {
    return (process.env.PORT ?? 8000) as number
  }

  /**
   * enable cloud function logging, default is `always`
   * - `always` means that all cloud functions' execution will be logged
   * - `debug` means that only logging for debug invokes
   * - `never` no logging any case
   */
  static get ENABLE_CLOUD_FUNCTION_LOG(): 'always' | 'debug' | 'never' {
    return (process.env.ENABLE_CLOUD_FUNCTION_LOG as any ?? 'always')
  }

  /**
   * in production deploy or not
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }
}