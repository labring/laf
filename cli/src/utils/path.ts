import * as fs from 'node:fs'
import { stringify, parse } from 'yaml'

export function getHomeDir() {
  return "/Users/mac/Work/laf-cli-test/";
}

export function ensureDirectory(dir: string) {
  try {
    fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK)
  } catch (err) {
    fs.mkdirSync(dir, { recursive: true })
  }
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