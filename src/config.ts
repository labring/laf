import { ConnectionOptions } from 'mysql2'

export default class Config {
  static get db(): ConnectionOptions {
    return {
      database: process.env['DB'] ?? 'less_framework',
      user: process.env['DB_USER'] ?? "root",
      password: process.env['DB_PASSWORD'] ?? "kissme888",
      host: process.env['DB_HOST'] ?? "localhost",
      port: (process.env['PORT'] ?? 3306) as number,
      connectionLimit: (process.env['DB_POOL_LIMIT'] ?? 100) as number
    }
  }

  static get SERVER_SALT(): string {
    return process.env['SERVER_SALT'] ?? 'abcdefg1234567!@#$%^&sadfqwef&*^*#!@^'
  }
}