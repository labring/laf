import { DEPLOY_SCHEMA_NAME } from '../common/constant'
import { exist, loadYamlFile } from '../util/file'
import { getAppPath } from '../util/sys'
import * as path from 'node:path'

export class DeploySchema {
  name: string

  resources?: {
    buckets?: BucketResource[]
    websites?: WebsiteResource[]
  }

  actions?: {
    buckets?: BucketAction[]
  }

  static read(): DeploySchema {
    const configPath = path.join(getAppPath(), DEPLOY_SCHEMA_NAME)
    return loadYamlFile(configPath)
  }

  static exist(): boolean {
    const configPath = path.join(getAppPath(), DEPLOY_SCHEMA_NAME)
    return exist(configPath)
  }
}

export class BucketResource {
  name: string
  policy: 'private' | 'readonly' | 'readwrite'
}

export class WebsiteResource {
  name: string
  bucketName: string
}

export class BucketAction {
  name: string
  bucketName: string
  srcDir: string
}
