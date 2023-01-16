import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: '.env.local' })
dotenv.config()

export class ServerConfig {
  static get DATABASE_URL() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined')
    }
    return process.env.DATABASE_URL
  }

  static get JWT_SECRET() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }
    return process.env.JWT_SECRET
  }

  static get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || '7d'
  }

  static get CASDOOR_ENDPOINT() {
    return process.env.CASDOOR_ENDPOINT
  }

  static get CASDOOR_APP_NAME() {
    return process.env.CASDOOR_APP_NAME
  }

  static get CASDOOR_CLIENT_ID() {
    return process.env.CASDOOR_CLIENT_ID
  }

  static get CASDOOR_CLIENT_SECRET() {
    return process.env.CASDOOR_CLIENT_SECRET
  }

  static get CASDOOR_REDIRECT_URI() {
    return process.env.CASDOOR_REDIRECT_URI
  }

  static get CASDOOR_PUBLIC_CERT() {
    return process.env.CASDOOR_PUBLIC_CERT
  }

  static get CASDOOR_ORG_NAME() {
    return process.env.CASDOOR_ORG_NAME
  }

  static get SYSTEM_NAMESPACE() {
    return process.env.SYSTEM_NAMESPACE || 'laf-system'
  }

  static get APPID_LENGTH(): number {
    return parseInt(process.env.APPID_LENGTH || '6')
  }

  static get DEFAULT_RUNTIME_IMAGE() {
    const image =
      process.env.DEFAULT_RUNTIME_IMAGE ||
      'docker.io/lafyun/runtime-node:latest'

    const initImage =
      process.env.DEFAULT_RUNTIME_INIT_IMAGE ||
      'docker.io/lafyun/runtime-node-init:latest'
    return {
      image: {
        main: image,
        init: initImage,
      },
      version: 'latest',
    }
  }

  static get API_SERVER_URL() {
    return process.env.API_SERVER_URL || 'http://localhost:3000'
  }

  static get DOMAIN() {
    return process.env.DOMAIN || 'localhost'
  }

  static get APISIX_API_URL() {
    return process.env.APISIX_API_URL
  }

  static get APISIX_API_KEY() {
    return process.env.APISIX_API_KEY
  }

  static get MINIO_DOMAIN() {
    return process.env.MINIO_DOMAIN
  }

  static get MINIO_EXTERNAL_ENDPOINT() {
    return process.env.MINIO_EXTERNAL_ENDPOINT
  }

  static get MINIO_INTERNAL_ENDPOINT() {
    return process.env.MINIO_INTERNAL_ENDPOINT
  }

  static get MINIO_ROOT_ACCESS_KEY() {
    return process.env.MINIO_ROOT_ACCESS_KEY
  }

  static get MINIO_ROOT_SECRET_KEY() {
    return process.env.MINIO_ROOT_SECRET_KEY
  }
}

export class ResourceLabels {
  static get USER_ID() {
    return 'laf.dev/user.id'
  }

  static get APP_ID() {
    return 'laf.dev/appid'
  }

  static get DISPLAY_NAME() {
    return 'laf.dev/display.name'
  }

  static get NAMESPACE_TYPE() {
    return 'laf.dev/namespace.type'
  }
}

export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH']

export const CN_PUBLISHED_FUNCTIONS = '__functions__'
export const CN_PUBLISHED_POLICIES = '__policies__'
export const CN_FUNCTION_LOGS = '__function_logs__'

export const CPU_UNIT = 1000
export const MB = 1024 * 1024
export const GB = 1024 * MB

export const APPLICATION_SECRET_KEY = 'SERVER_SECRET'

export const MAX_FUNCTION_COUNT = 1000

export const MINIO_COMMON_USER_GROUP = 'laf_owner_by_prefix_group'
export const MINIO_COMMON_USER_POLICY = 'laf_owner_by_prefix'
