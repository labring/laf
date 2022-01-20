import * as dotenv from "dotenv"

/**
 * parse environment vars from the `.env` file if existing
 */
dotenv.config()

export default class Config {
  /**
   * mongodb connection configuration
   */
  static get DB_URI() {
    if (!process.env["DB_URI"]) {
      throw new Error("env: `DB_URI` is missing")
    }
    return process.env["DB_URI"]
  }
  /**
   * the serving port, default is 9010
   */
  static get PORT(): number {
    return (process.env.PORT ?? 9010) as number
  }

  /**
   * the logger level : 'fatal', 'error', 'warning', 'info', 'debug', 'trace'
   */
  static get LOG_LEVEL():
    | "fatal"
    | "error"
    | "warning"
    | "info"
    | "debug"
    | "trace" {
    return (process.env["LOG_LEVEL"] as any) ?? (this.isProd ? "info" : "debug")
  }

  /**
   * in production deploy or not
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === "production"
  }

  /**
   * the server secret salt, mainly used for generating tokens
   */
  static get SERVER_SECRET_SALT(): string {
    const secret_salt = process.env["SERVER_SECRET_SALT"]
    if (!secret_salt) {
      throw new Error("env: `SERVER_SECRET_SALT` is missing")
    }
    return secret_salt
  }

  /**
   * value of HTTP header Cache-Control: max-age=120 while download file
   */
  static get FILE_SYSTEM_HTTP_CACHE_CONTROL(): string {
    return process.env["FILE_SYSTEM_HTTP_CACHE_CONTROL"]
  }
}
