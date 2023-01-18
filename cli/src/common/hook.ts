import { existApplicationConfig } from "../config/application"
import { existSecretConfig, readSecretConfig, refreshSecretConfig } from "../config/secret"

export function checkApplication() {
  if (!existApplicationConfig()) {
    console.error('Please run "laf app init" to initialize the application first')
    process.exit(1)
  }
}

export function checkFunctionDebugToken() {
  if (!existSecretConfig()) {
    refreshSecretConfig()
    return
  }
  const secretConfig = readSecretConfig()
  const { debugToken, debugTokenExpire } = secretConfig.functionSecretConfig
  let timestamp = Date.parse(new Date().toString()) / 1000
  if (!debugToken || debugTokenExpire < timestamp) {
    refreshSecretConfig()
  }
}