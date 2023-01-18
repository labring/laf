import * as path from "path"
import { authControllerPat2Token } from "../api/v1/authentication"
import { Pat2TokenDto } from "../api/v1/data-contracts"
import { CONFIG_FILE_NAME, TOKEN_EXPIRE } from "../common/constant"
import { loadYamlFile, writeYamlFile, exist, remove, ensureDirectory } from "../util/file"

//SystemConfig is the configuration for the config file
export interface SystemConfig {
  remoteServer?: string
  token?: string
  tokenExpire?: number
  pat?: string
}

export function readSystemConfig(): SystemConfig {
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf', CONFIG_FILE_NAME)
  return loadYamlFile(configPath)
}

export function writeSystemConfig(config: SystemConfig) {
  const directoryPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf')
  ensureDirectory(directoryPath)
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf', CONFIG_FILE_NAME)
  writeYamlFile(configPath, config)
}

export function existSystemConfig(): boolean {
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf', CONFIG_FILE_NAME)
  return exist(configPath)
}

export function removeSystemConfig() {
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.laf', CONFIG_FILE_NAME)
  remove(configPath)
}

export async function refreshToken(): Promise<string> {
  const systemConfig = readSystemConfig()
  const timestamp = Date.parse(new Date().toString()) / 1000
  if (timestamp > systemConfig.tokenExpire) {
    const patDto: Pat2TokenDto = {
      pat: systemConfig.pat,
    }
    const token = await authControllerPat2Token(patDto)
    systemConfig.token = token
    systemConfig.tokenExpire = timestamp + TOKEN_EXPIRE
    writeSystemConfig(systemConfig)
    return token
  }
  return systemConfig.token
}