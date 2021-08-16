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
  static get db() {
    if (!process.env['DB']) {
      throw new Error('env: `DB` is missing')
    }

    if (!process.env['DB_URI']) {
      throw new Error('env: `DB_URI` is missing')
    }

    return {
      database: process.env['DB'],
      uri: process.env['DB_URI'],
      maxPoolSize: (process.env['DB_POOL_LIMIT'] ?? 10) as number,
    }
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
   * the file system driver: 'local', 'gridfs'
   */
  static get FILE_SYSTEM_DRIVER(): string {
    return process.env['FILE_SYSTEM_DRIVER'] ?? 'gridfs'
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
   * the logger level : 'fatal', 'error', 'warning', 'debug', 'info', 'trace'
   */
  static get LOG_LEVEL(): string {
    return process.env['LOG_LEVEL'] ?? (this.isProd ? 'info' : 'debug')
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
  static get ENABLE_CLOUD_FUNCTION_LOG(): string {
    return (process.env.ENABLE_CLOUD_FUNCTION_LOG ?? 'always')
  }

  /**
   * in production deploy or not
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }
}