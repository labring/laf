import * as path from 'path'
import { APP_SCHEMA_NAME } from "../common/constant"
import { getAppPath } from "../util/sys"
import { loadYamlFile, writeYamlFile } from "../util/file"

class AppSchema {
  name: string
  appid: string
  invokeUrl?: string
  function?: {
    debugToken?: string
    debugTokenExpire?: number
  }
  storage?: {
    endpoint: string
    accessKeyId: string
    accessKeySecret: string
    sessionToken?: string
    expire: number
  }

  static read() {
    const configPath = path.join(getAppPath(), APP_SCHEMA_NAME)
    return loadYamlFile(configPath)
  }

  static write(schema: AppSchema) {
    const configPath = path.join(getAppPath(), APP_SCHEMA_NAME)
    return writeYamlFile(configPath, schema)
  }
}
