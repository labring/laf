import * as path from "path";
import { APPLICATION_CONFIG_FILE_NAME } from "../common/constant";
import { exist, loadYamlFile, remove, writeYamlFile } from "../util/file";

// ApplicationConfig is the configuration for an application.
export interface ApplicationConfig {
  name: string;
  appid: string;
  regionName?: string;
  bundleName?: string;
  runtimeName?: string;
  invokeUrl?: string;
  createdAt?: string;
}

export function readApplicationConfig(): ApplicationConfig {
  const configPath = path.join(process.cwd(), APPLICATION_CONFIG_FILE_NAME)
  return loadYamlFile(configPath)
}

export function writeApplicationConfig(config: ApplicationConfig) {
  const configPath = path.join(process.cwd(), APPLICATION_CONFIG_FILE_NAME)
  writeYamlFile(configPath, config)
}

export function existApplicationConfig(): boolean {
  const configPath = path.join(process.cwd(), APPLICATION_CONFIG_FILE_NAME)
  return exist(configPath); 
}

export function removeApplicationConfig() {
  const configPath = path.join(process.cwd(), APPLICATION_CONFIG_FILE_NAME)
  remove(configPath)
}
