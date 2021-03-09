import { ConnectionOptions } from 'mysql2'

export default class Config {
  static get db() : ConnectionOptions{
    return {
      database: 'less_framework',
      user: "root",
      password: "kissme888",
      host: "localhost",
      port: 3306,
      connectionLimit: 100
    }
  }
}