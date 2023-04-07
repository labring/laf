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

  static get SYSTEM_NAMESPACE() {
    return process.env.SYSTEM_NAMESPACE || 'laf-system'
  }

  /* switcher of task controllers */

  static get DISABLED_INSTANCE_TASK() {
    return process.env.DISABLED_INSTANCE_TASK === 'true'
  }

  static get DISABLED_APPLICATION_TASK() {
    return process.env.DISABLED_APPLICATION_TASK === 'true'
  }

  static get DISABLED_GATEWAY_TASK() {
    return process.env.DISABLED_GATEWAY_TASK === 'true'
  }

  static get DISABLED_SUBSCRIPTION_TASK() {
    return process.env.DISABLED_GATEWAY_TASK === 'true'
  }

  static get DISABLED_STORAGE_TASK() {
    return process.env.DISABLED_STORAGE_TASK === 'true'
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

  static get certManagerIssuerName() {
    return process.env.CERT_MANAGER_ISSUER_NAME || 'laf-issuer'
  }

  /** default region conf */
  static get DEFAULT_REGION_DATABASE_URL() {
    return process.env.DEFAULT_REGION_DATABASE_URL
  }

  static get DEFAULT_REGION_RUNTIME_DOMAIN() {
    return process.env.DEFAULT_REGION_RUNTIME_DOMAIN || 'localhost'
  }

  static get DEFAULT_REGION_WEBSITE_DOMAIN() {
    return process.env.DEFAULT_REGION_WEBSITE_DOMAIN || 'localhost'
  }

  static get DEFAULT_REGION_TLS(): boolean {
    return process.env.DEFAULT_REGION_TLS === 'true'
  }

  static get DEFAULT_REGION_APISIX_PUBLIC_PORT() {
    return parseInt(process.env.DEFAULT_REGION_APISIX_PUBLIC_PORT || '80')
  }

  static get DEFAULT_REGION_APISIX_API_URL() {
    return process.env.DEFAULT_REGION_APISIX_API_URL
  }

  static get DEFAULT_REGION_APISIX_API_KEY() {
    return process.env.DEFAULT_REGION_APISIX_API_KEY
  }

  static get DEFAULT_REGION_MINIO_DOMAIN() {
    return process.env.DEFAULT_REGION_MINIO_DOMAIN
  }

  static get DEFAULT_REGION_MINIO_EXTERNAL_ENDPOINT() {
    return process.env.DEFAULT_REGION_MINIO_EXTERNAL_ENDPOINT
  }

  static get DEFAULT_REGION_MINIO_INTERNAL_ENDPOINT() {
    return process.env.DEFAULT_REGION_MINIO_INTERNAL_ENDPOINT
  }

  static get DEFAULT_REGION_MINIO_ROOT_ACCESS_KEY() {
    return process.env.DEFAULT_REGION_MINIO_ROOT_ACCESS_KEY
  }

  static get DEFAULT_REGION_MINIO_ROOT_SECRET_KEY() {
    return process.env.DEFAULT_REGION_MINIO_ROOT_SECRET_KEY
  }
}

export const LABEL_KEY_USER_ID = 'laf.dev/user.id'
export const LABEL_KEY_APP_ID = 'laf.dev/appid'
export const LABEL_KEY_NAMESPACE_TYPE = 'laf.dev/namespace.type'
export const LABEL_KEY_BUNDLE = 'laf.dev/bundle'
export const LABEL_KEY_NODE_TYPE = 'laf.dev/node.type'
export enum NodeType {
  Runtime = 'runtime',
  Database = 'database',
  Storage = 'storage',
}

// Runtime constants
export const HTTP_METHODS = ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH']

export const CN_PUBLISHED_FUNCTIONS = '__functions__'
export const CN_PUBLISHED_POLICIES = '__policies__'
export const CN_FUNCTION_LOGS = '__function_logs__'

export const X_LAF_TRIGGER_TOKEN_KEY = 'x-laf-trigger-token'
export const X_LAF_DEVELOP_TOKEN_KEY = 'x-laf-develop-token'
export const APPLICATION_SECRET_KEY = 'SERVER_SECRET'

// Cluster constants
export const MINIO_COMMON_USER_GROUP = 'laf_owner_by_prefix_group'
export const MINIO_COMMON_USER_POLICY = 'laf_owner_by_prefix'

// Date & times
export const ONE_DAY_IN_SECONDS = 60 * 60 * 24 // 1 day in seconds
export const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7 // 7 days in seconds
export const ONE_MONTH_IN_SECONDS = 60 * 60 * 24 * 31 // 31 days in seconds
export const FOREVER_IN_SECONDS = 60 * 60 * 24 * 365 * 1000 // 1000 years in seconds
export const TASK_LOCK_INIT_TIME = new Date(0) // 1970-01-01 00:00:00
export const MILLISECONDS_PER_DAY = 60 * 60 * 24 * 1000 // 1 day in milliseconds
export const MILLISECONDS_PER_MINUTE = 60 * 1000 // 1 minute in milliseconds

// Resource units
export const CPU_UNIT = 1000
export const MB = 1024 * 1024
export const GB = 1024 * MB

// auth constants
export const PHONE_AUTH_PROVIDER_NAME = 'phone'
export const PASSWORD_AUTH_PROVIDER_NAME = 'user-password'

// Sms constants
export const ALISMS_KEY = 'alisms'
export const LIMIT_CODE_FREQUENCY = 60 * 1000 // 60 seconds (in milliseconds)
export const LIMIT_CODE_PER_IP_PER_DAY = 30 // 30 times
export const CODE_VALIDITY = 10 * 60 * 1000 // 10 minutes (in milliseconds)
