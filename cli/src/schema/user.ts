import path = require('path')
import { ensureDirectory, exist, loadYamlFile, writeYamlFile } from '../util/file'
import { DEFAULT_SERVER, TOKEN_EXPIRE, USER_SCHEMA_NAME } from '../common/constant'
import { pat2token } from '../api/pat'

export class UserSchema {
  users: {
    name: string
    server: string
    pat?: string
    token?: string
    expire?: number
  }[]
  selected: number

  static getCurrentUser() {
    const schema = this.read()
    return schema.users[schema.selected]
  }

  static async refreshToken() {
    const user = this.getCurrentUser()
    const timestamp = Date.parse(new Date().toString()) / 1000
    if (timestamp > user.expire) {
      const patDto = {
        pat: user.pat,
      }
      const token = await pat2token(user.server, patDto)
      const schema = this.read()
      schema.users[schema.selected].token = token
      schema.users[schema.selected].expire = timestamp + TOKEN_EXPIRE
      this.write(schema)
      return token
    }
    return user.token
  }

  static read(): UserSchema {
    if (!this.exist()) {
      this.write({
        users: [
          {
            name: 'default',
            server: DEFAULT_SERVER,
          },
        ],
        selected: 0,
      })
    }
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf', USER_SCHEMA_NAME)
    return loadYamlFile(configPath)
  }

  static write(schema: UserSchema) {
    const directoryPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf')
    ensureDirectory(directoryPath)
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf', USER_SCHEMA_NAME)
    writeYamlFile(configPath, schema)
  }

  static exist() {
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf', USER_SCHEMA_NAME)
    return exist(configPath)
  }
}
