import { ConnectionOptions } from 'mysql2'

export default class Config {
  static get db(): ConnectionOptions {
    return {
      database: process.env['DB'] ?? 'less_framework',
      user: process.env['DB_USER'] ?? "root",
      password: process.env['DB_PASSWORD'] ?? "kissme",
      host: process.env['DB_HOST'] ?? "127.0.0.1",
      port: (process.env['PORT'] ?? 3306) as number,
      connectionLimit: (process.env['DB_POOL_LIMIT'] ?? 100) as number
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
}