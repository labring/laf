import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: '.env.local' })
dotenv.config()

export class ServerConfig {
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
