import * as path from "path"
import { applicationControllerFindOne } from "../api/v1/application"
import { DEBUG_TOKEN_EXPIRE, SECRET_FILE_NAME } from "../common/constant"
import { exist, loadYamlFile, writeYamlFile } from "../util/file"
import { readApplicationConfig } from "./application"

export interface secretConfig {
  functionSecretConfig: functionSecretConfig
}

export interface functionSecretConfig {
  debugToken: string
  debugTokenExpire: number
}

export function readSecretConfig(): secretConfig {
  const configPath = path.join(process.cwd(), SECRET_FILE_NAME)
  return loadYamlFile(configPath)
}

export function writeSecretConfig(config: secretConfig) {
  const configPath = path.join(process.cwd(), SECRET_FILE_NAME)
  writeYamlFile(configPath, config)
}

export function existSecretConfig(): boolean {
  const configPath = path.join(process.cwd(), SECRET_FILE_NAME)
  return exist(configPath)
}

export async function refreshSecretConfig() {
  const appConfig = readApplicationConfig()
  const app = await applicationControllerFindOne(appConfig.appid)
  let timestamp = Date.parse(new Date().toString()) / 1000

  const secretConfig = {
    functionSecretConfig: {
      debugToken: app.function_debug_token,
      debugTokenExpire: timestamp + DEBUG_TOKEN_EXPIRE,
    }
  }
  writeSecretConfig(secretConfig)
}