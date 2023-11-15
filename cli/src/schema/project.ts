import * as path from 'path'
import { getAppPath } from '../util/sys'
import { exist, loadYamlFile, writeYamlFile } from '../util/file'
import { PROJECT_SCHEMA_NAME } from '../common/constant'

export class ProjectSchema {
  version: string
  name: string
  metadata?: {
    description?: string
    author?: string
    license?: string
    homepage?: string
    repository?: string
  }
  spec: {
    runtime: string
    dependencies?: object
    baseDir?: string
    bucket?: string[]
  }

  static read(): ProjectSchema {
    const configPath = path.join(getAppPath(), PROJECT_SCHEMA_NAME)
    return loadYamlFile(configPath)
  }

  static write(schema: ProjectSchema) {
    const configPath = path.join(getAppPath(), PROJECT_SCHEMA_NAME)
    return writeYamlFile(configPath, schema)
  }

  static exist() {
    const configPath = path.join(getAppPath(), PROJECT_SCHEMA_NAME)
    return exist(configPath)
  }
}
