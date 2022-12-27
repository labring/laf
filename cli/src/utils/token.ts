import { ConfigMetadata } from "../templates/config"
import { CONFIG_FILE_NAME, DEFAULT_REMOTE_SERVER } from "./constant";
import { getConfigDir, loadYamlFile } from "./path";
import * as path from 'node:path'
import * as fs from 'node:fs'

export function getConfigData(): ConfigMetadata {
  const configPath = path.join(getConfigDir(), CONFIG_FILE_NAME);
  if (!fs.existsSync(configPath)) {
    return {
      remoteServer: DEFAULT_REMOTE_SERVER,
      accessToken: null,
    }
  }
  return loadYamlFile(configPath);
}

export function getAccessToken(): string {
  return getConfigData()?.accessToken
}

export function getRemoteServer(): string {
  return getConfigData()?.remoteServer
}