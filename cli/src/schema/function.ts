import * as path from 'path'
import { FUNCTION_SCHEMA_DIRECTORY, FUNCTION_SCHEMA_SUFFIX } from '../common/constant'
import { exist, loadYamlFile, remove, writeYamlFile } from '../util/file'
import { getBaseDir } from '../util/sys'
import { mkdirSync } from 'fs'

export class FunctionSchema {
  name: string
  desc?: string
  tags?: string[]
  methods: string[]

  static read(name: string): FunctionSchema {
    const funcConfigPath = path.join(getBaseDir(), FUNCTION_SCHEMA_DIRECTORY, name + FUNCTION_SCHEMA_SUFFIX)
    return loadYamlFile(funcConfigPath)
  }

  static write(name: string, schema: FunctionSchema): void {
    if (path.dirname(name) !== '.') {
      const dir = path.join(getBaseDir(), FUNCTION_SCHEMA_DIRECTORY, path.dirname(name))
      if (!exist(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    }
    const funcConfigPath = path.join(getBaseDir(), FUNCTION_SCHEMA_DIRECTORY, name + FUNCTION_SCHEMA_SUFFIX)
    return writeYamlFile(funcConfigPath, schema)
  }

  static exist(name: string): boolean {
    const funcConfigPath = path.join(getBaseDir(), FUNCTION_SCHEMA_DIRECTORY, name + FUNCTION_SCHEMA_SUFFIX)
    return exist(funcConfigPath)
  }

  static delete(name: string) {
    const funcConfigPath = path.join(getBaseDir(), FUNCTION_SCHEMA_DIRECTORY, name + FUNCTION_SCHEMA_SUFFIX)
    remove(funcConfigPath)
  }
}
