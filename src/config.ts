
import path = require('path')
export default class Config {
  static get db() {
    return {
      database: process.env['DB'] ?? 'less_framework',
      uri: process.env['DB_URI'] ?? 'mongodb://localhost:27017',
      poolSize: (process.env['DB_POOL_LIMIT'] ?? 100) as number,

      // user: process.env['DB_USER'] ?? "root",
      // password: process.env['DB_PASSWORD'] ?? "kissme",
      // host: process.env['DB_HOST'] ?? "127.0.0.1",
      // port: (process.env['PORT'] ?? 3306) as number,
    }
  }

  static get SERVER_SALT(): string {
    return process.env['SERVER_SALT'] ?? 'abcdefg1234567!@#$%^&sadfqwef&*^*#!@^'
  }

  // 初始化第一个管理员的用户名
  static get SUPER_ADMIN(): string {
    return process.env['SUPER_ADMIN'] ?? 'less-admin'
  }

  // 初始化第一个管理员的密码
  static get SUPER_ADMIN_PASSWORD(): string {
    return process.env['SUPER_ADMIN_PASSWORD'] ?? 'less-framework'
  }

  // 本地上传文件存储目录
  static get LOCAL_STORAGE_ROOT_PATH(): string {
    return process.env['LOCAL_STORAGE_ROOT_PATH'] ?? path.join(process.cwd(), "data")
  }

  // 临时文件目录
  static get TMP_PATH(): string {
    return process.env['TMP_PATH'] ?? path.join(process.cwd(), "tmp/uploads")
  }

  static get LOG_LEVEL(): string {
    return process.env['LOG_LEVEL'] ?? 'debug'
  }
}