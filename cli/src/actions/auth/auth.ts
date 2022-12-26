import { ensureDirectory, getConfigDir, writeYamlFile } from "../../utils/path";
import * as path from 'node:path'
import * as fs from 'node:fs'
import { CONFIG_FILE_NAME } from "../../utils/constant";
import { getConfigData } from "../../utils/token";

export async function handleLogin(token: string, options: { remote: string }) {
  let configData = getConfigData()
  // TODO check token
  configData.accessToken = token;
  if (options.remote !== '') {
    configData.remoteServer = options.remote
  }
  const configDir = getConfigDir()
  ensureDirectory(configDir)
  const configPath = path.join(configDir, CONFIG_FILE_NAME);
  writeYamlFile(configPath, configData);
  console.log("login success")
}

export async function handleLogout() {
  const configDir = getConfigDir();
  const configPath = path.join(configDir, CONFIG_FILE_NAME);
  fs.rmSync(configPath);
  console.log("logout success")
}