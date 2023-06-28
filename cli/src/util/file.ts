import * as fs from 'node:fs'
import * as path from 'node:path'
import { parse, stringify } from 'yaml'
import { createHash } from 'node:crypto'

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
  const metadataStr = fs.readFileSync(filePath, 'utf-8')
  const yamlData = parse(metadataStr)
  return yamlData
}

export function writeYamlFile(filePath: string, data: any) {
  const yamlData = stringify(data)
  fs.writeFileSync(filePath, yamlData)
}

export function readDirectoryRecursive(dir: string): string[] {
  const files = fs.readdirSync(dir)
  const result = []
  for (const file of files) {
    const filepath = path.join(dir, file)
    const stats = fs.statSync(filepath)
    if (stats.isDirectory()) {
      result.push(...readDirectoryRecursive(filepath))
    } else {
      result.push(filepath)
    }
  }
  return result
}

// compare file md5
export function compareFileMD5(sourceFile: string, bucketObject: any) {
  const sourceData = fs.readFileSync(sourceFile)
  const sourceFileMD5 = createHash('md5').update(sourceData).digest('hex')
  const etag = bucketObject.ETag.replace(/\"/g, '')
  return sourceFileMD5 === etag
}
