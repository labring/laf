import * as path from "path"
import { applicationControllerFindOne } from "../api/v1/application"
import { DEBUG_TOKEN_EXPIRE, SECRET_FILE_NAME, STORAGE_TOKEN_EXPIRE } from "../common/constant"
import { exist, loadYamlFile, writeYamlFile } from "../util/file"
import { readApplicationConfig } from "./application"

export interface SecretConfig {
  functionSecretConfig: FunctionSecretConfig
  storageSecretConfig: StorageSecretConfig
}

export interface FunctionSecretConfig {
  debugToken: string
  debugTokenExpire: number
}

export interface StorageSecretConfig {
  endpoint: string
  accessKeyId: string
  accessKeySecret: string
  sessionToken?: string
  expire: number
}

export function readSecretConfig(): SecretConfig {
  const configPath = path.join(process.cwd(), SECRET_FILE_NAME)
  return loadYamlFile(configPath)
}

export function writeSecretConfig(config: SecretConfig) {
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
    },
    storageSecretConfig: {
      endpoint: app.storage.credentials.endpoint,
      accessKeyId: app.storage.credentials.accessKeyId,
      accessKeySecret: app.storage.credentials.secretAccessKey,
      sessionToken: app.storage.credentials.sessionToken,
      expire: timestamp + STORAGE_TOKEN_EXPIRE,
    }
  }
  console.log(secretConfig)
  writeSecretConfig(secretConfig)
}