import * as path from 'node:path'
import * as fs from 'node:fs'
import { getAppPath } from '../util/sys'
import { ENVIRONMENT_SCHEMA_NAME } from '../common/constant'
import * as dotenv from 'dotenv'
import { exist } from '../util/file'

export class EnvironmentSchema {
  variables: EnvironmentVariable[]

  static read(): EnvironmentVariable[] {
    const configPath = path.join(getAppPath(), ENVIRONMENT_SCHEMA_NAME)
    if (!exist(configPath)) {
      return null
    }
    const dataStr = fs.readFileSync(configPath, 'utf-8')
    const data = dotenv.parse(dataStr)
    const env: EnvironmentVariable[] = []
    for (const key in data) {
      env.push({
        name: key,
        value: data[key],
      })
    }
    return env
  }

  static write(env: EnvironmentVariable[]): void {
    const configPath = path.join(getAppPath(), ENVIRONMENT_SCHEMA_NAME)
    let dataStr = ''
    for (const item of env) {
      dataStr += `${item.name}=${item.value}\n`
    }
    fs.writeFileSync(configPath, dataStr)
  }
}

export interface EnvironmentVariable {
  name: string
  value: string
}
