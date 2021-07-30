import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

/**
 * 应用运行配置管理
 */
export default class Config {
  /**
   * 获取 devops sys 连接配置
   */
  static get sys_db() {
    if(!process.env['SYS_DB']) {
      throw new Error('env: `SYS_DB` is missing')
    }

    if(!process.env['SYS_DB_URI']) {
      throw new Error('env: `SYS_DB_URI` is missing')
    }

    return {
      database: process.env['SYS_DB'],
      uri: process.env['SYS_DB_URI'],
      poolSize: (process.env['SYS_DB_POOL_LIMIT'] ?? 10) as number,
    }
  }

  /**
   * 获取 app db 连接配置
   */
  static get app_db() {
    if(!process.env['APP_DB']) {
      throw new Error('env: `APP_DB` is missing')
    }

    if(!process.env['APP_DB_URI']) {
      throw new Error('env: `APP_DB_URI` is missing')
    }

    return {
      database: process.env['APP_DB'],
      uri: process.env['APP_DB_URI'],
      poolSize: (process.env['APP_DB_POOL_LIMIT'] ?? 100) as number,
    }
  }

  /**
   * 指定 devops server 服务端密钥，用于生成 devops token 
   */
  static get SYS_SERVER_SECRET_SALT(): string {
    const secret_salt = process.env['SYS_SERVER_SECRET_SALT']
    if(!secret_salt) {
      throw new Error('env: `SYS_SERVER_SECRET_SALT` is missing')
    }
    return secret_salt
  }

  /**
   * 指定 app server 服务端密钥，用于生成 app token 
   */
   static get APP_SERVER_SECRET_SALT(): string {
    const secret_salt = process.env['APP_SERVER_SECRET_SALT']
    if(!secret_salt) {
      throw new Error('env: `APP_SERVER_SECRET_SALT` is missing')
    }
    return secret_salt
  }

  /**
   * 初始化第一个管理员的用户名
   */
  static get SYS_ADMIN(): string {
    if(!process.env['SYS_ADMIN']) {
      throw new Error('env: `SYS_ADMIN` is missing')
    }

    return process.env['SYS_ADMIN']
  }

  /**
   * 初始化第一个管理员的密码
   */
  static get SYS_ADMIN_PASSWORD(): string {
    if(!process.env['SYS_ADMIN_PASSWORD']) {
      throw new Error('env: `SYS_ADMIN_PASSWORD` is missing')
    }
    return process.env['SYS_ADMIN_PASSWORD']
  }

  /**
   * 临时文件目录
   */
  static get TMP_PATH(): string {
    const tmp_path =  process.env['TMP_PATH'] ?? path.join(process.cwd(), "tmp")
    return tmp_path
  }

  /**
   * 指定日志级别
   */
  static get LOG_LEVEL(): string {
    return process.env['LOG_LEVEL'] ?? (this.isProd ? 'info' : 'debug')
  }

  /**
   * 指定服务监听端口号，缺省为 9000
   */
  static get PORT(): number{
    return (process.env.PORT ?? 9000) as number
  }

  /**
   * 是否生产环境
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }
}