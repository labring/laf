import * as path from 'path'
import { FUNCTION_SCHEMA_DIRECTORY, FUNCTION_SCHEMA_SUFFIX } from '../common/constant'
import { exist, loadYamlFile, remove, writeYamlFile } from '../util/file'

export class FunctionSchema {
  name: string
  description?: string
  tags?: string[]
  methods: string[]

  static read(name: string): FunctionSchema {
    const funcConfigPath = path.join(process.cwd(), FUNCTION_SCHEMA_DIRECTORY, name + FUNCTION_SCHEMA_SUFFIX)
    return loadYamlFile(funcConfigPath)
  }

  static write(name: string, schema: FunctionSchema): void {
    const funcConfigPath = path.join(process.cwd(), FUNCTION_SCHEMA_DIRECTORY, name + FUNCTION_SCHEMA_SUFFIX)
    return writeYamlFile(funcConfigPath, schema)
  }

  static exist(name: string): boolean {
    const funcConfigPath = path.join(process.cwd(), FUNCTION_SCHEMA_DIRECTORY, name + FUNCTION_SCHEMA_SUFFIX)
    return exist(funcConfigPath)
  }

  static delete(name: string) {
    const funcConfigPath = path.join(process.cwd(), FUNCTION_SCHEMA_DIRECTORY, name + FUNCTION_SCHEMA_SUFFIX)
    remove(funcConfigPath)
  }
}
