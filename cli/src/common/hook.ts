import { existApplicationConfig } from "../config/application"
import { existSecretConfig, readSecretConfig, refreshSecretConfig } from "../config/secret"

export function checkApplication() {
  if (!existApplicationConfig()) {
    console.error('Please run "laf app init" to initialize the application first')
    process.exit(1)
  }
}

export async function checkFunctionDebugToken() {
  if (!existSecretConfig()) {
    await refreshSecretConfig()
    return
  }
  const secretConfig = readSecretConfig()
  const { debugToken, debugTokenExpire } = secretConfig.functionSecretConfig
  let timestamp = Date.parse(new Date().toString()) / 1000
  if (!debugToken || debugTokenExpire < timestamp) {
    await refreshSecretConfig()
  }
}

export async function checkStorageToken() { 
  if (!existSecretConfig()) {
    await refreshSecretConfig()
    return
  }
  const secretConfig = readSecretConfig()
  const { expire } = secretConfig.storageSecretConfig
  let timestamp = Date.parse(new Date().toString()) / 1000
  if (expire < timestamp) {
    await refreshSecretConfig()
  }
}