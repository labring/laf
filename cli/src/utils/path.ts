import * as fs from 'node:fs'
import * as path from 'node:path'
import { stringify, parse } from 'yaml'
import { ConfigMetadata } from '../templates/config';
import { CONFIG_FILE_NAME, DEFAULT_REMOTE_SERVER } from './constant';

export function getHomeDir() {
  return "/Users/mac/Work/laf-cli-test/";
}

export function getConfigDir() {
  return path.join(process.env.HOME || process.env.USERPROFILE, '/.laf')
}

export function ensureDirectory(dir: string) {
  try {
    fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK)
  } catch (err) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function ensureSystemConfig() {
  const configDir = getConfigDir();
  ensureDirectory(configDir);
  const configData: ConfigMetadata = {
    remoteServer: DEFAULT_REMOTE_SERVER,
    accessToken: null,
  }
  writeYamlFile(path.join(configDir, CONFIG_FILE_NAME), configData);
}

export function exist(fp: string): boolean {
  return fs.existsSync(fp);
}

export function loadYamlFile(filePath: string): any {
  const metadataStr =  fs.readFileSync(filePath, 'utf-8')
  const yamlData = parse(metadataStr);
  return yamlData;
}

export function writeYamlFile(filePath: string, data: any) {
  const yamlData = stringify(data);
  fs.writeFileSync(filePath, yamlData);
}