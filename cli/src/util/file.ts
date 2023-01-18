import * as fs from 'node:fs'
import { parse, stringify } from 'yaml';

export function exist(fp: string): boolean {
  return fs.existsSync(fp)
}

export function remove(fp: string) { 
  fs.unlinkSync(fp)
}

export function ensureDirectory(dir: string) {
  try {
    fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK)
  } catch (err) {
    fs.mkdirSync(dir, { recursive: true })
  }
}


export function loadYamlFile(filePath: string): any {
  const metadataStr =  fs.readFileSync(filePath, 'utf-8')
  const yamlData = parse(metadataStr)
  return yamlData
}

export function writeYamlFile(filePath: string, data: any) {
  const yamlData = stringify(data)
  fs.writeFileSync(filePath, yamlData)
}