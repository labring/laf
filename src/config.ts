import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

/**
 * 应用运行配置管理
 */
export default class Config {
  /**
   * 获取数据库连接配置
   */
  static get db() {
    if(!process.env['DB']) {
      throw new Error('env: `DB` is missing')
    }

    if(!process.env['DB_URI']) {
      throw new Error('env: `DB_URI` is missing')
    }

    return {
      database: process.env['DB'],
      uri: process.env['DB_URI'],
      poolSize: (process.env['DB_POOL_LIMIT'] ?? 100) as number,
    }
  }

  /**
   * 指定服务端密钥，用于生成 token 
   */
  static get SERVER_SALT(): string {
    const secret_salt = process.env['SERVER_SECRET_SALT']  ?? process.env['SERVER_SALT'] 
    if(!secret_salt) {
      throw new Error('env: `SERVER_SECRET_SALT` is missing')
    }
    return secret_salt
  }

  // 初始化第一个管理员的用户名
  static get SUPER_ADMIN(): string {
    if(!process.env['SUPER_ADMIN']) {
      throw new Error('env: `SUPER_ADMIN` is missing')
    }

    return process.env['SUPER_ADMIN']
  }

  // 初始化第一个管理员的密码
  static get SUPER_ADMIN_PASSWORD(): string {
    if(!process.env['SUPER_ADMIN_PASSWORD']) {
      throw new Error('env: `SUPER_ADMIN_PASSWORD` is missing')
    }
    return process.env['SUPER_ADMIN_PASSWORD']
  }

  // 本地上传文件存储目录
  static get LOCAL_STORAGE_ROOT_PATH(): string {
    return process.env['LOCAL_STORAGE_ROOT_PATH'] ?? path.join(process.cwd(), "data")
  }

  // 临时文件目录
  static get TMP_PATH(): string {
    return process.env['TMP_PATH'] ?? path.join(process.cwd(), "tmp/uploads")
  }

  /**
   * 指定日志级别
   */
  static get LOG_LEVEL(): string {
    return process.env['LOG_LEVEL'] ?? (this.isProd ? 'info' : 'debug')
  }

  /**
   * 指定服务监听端口号，缺省为 8080
   */
  static get PORT(): number{
    return (process.env.PORT ?? 8080) as number
  }

  /**
   * 是否生产环境
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }
}