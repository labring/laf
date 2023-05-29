import { AppSchema } from '../schema/app'

export function checkApplication() {
  if (!AppSchema.exist()) {
    console.error('Please run "laf app init" to initialize the application first')
    process.exit(1)
  }
}

export async function checkFunctionDebugToken() {
  const appSchema = AppSchema.read()
  const { debugToken, debugTokenExpire } = appSchema.function
  let timestamp = Date.parse(new Date().toString()) / 1000
  if (!debugToken || debugTokenExpire < timestamp) {
    await AppSchema.refresh()
  }
}

export async function checkStorageToken() {
  const appSchema = AppSchema.read()
  const { expire } = appSchema.storage
  let timestamp = Date.parse(new Date().toString()) / 1000
  if (expire < timestamp) {
    await AppSchema.refresh()
  }
}
