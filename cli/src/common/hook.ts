import { AppSchema } from '../schema/app'

export function checkApplication() {
  if (!AppSchema.exist()) {
    console.error('Please run "laf app init" to initialize the application first')
    process.exit(1)
  }
}

export async function checkFunctionDebugToken() {
  const appSchema = AppSchema.read()
  const { developToken, developTokenExpire } = appSchema.function
  const timestamp = Date.parse(new Date().toString()) / 1000
  if (!developToken || developTokenExpire < timestamp) {
    await AppSchema.refresh()
  }
}

export async function checkStorageToken() {
  const appSchema = AppSchema.read()
  const { expire } = appSchema.storage
  const timestamp = Date.parse(new Date().toString()) / 1000
  if (expire < timestamp) {
    await AppSchema.refresh()
  }
}
