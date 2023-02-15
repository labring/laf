import fse = require('fs-extra')
import path = require('path')
import { Constants } from './constants'
import { execSync } from 'child_process'
import Config from './config'

import { logger } from './support/logger'

async function main() {
  try {
    installPackages()

    await ensureCollectionIndexes()
  } catch (error) {
    logger.error(error)
    return 1
  }

  return 0
}

main()
  .then((code) => {
    process.exit(code)
  })
  .catch((err) => {
    logger.error(err)
    process.exit(2)
  })


export function isCloudSdkPackageExists() {
  const target = path.resolve(__dirname, '../../../node_modules/@')
  const pkgJsonPath = path.join(target, 'package.json')
  return fse.existsSync(pkgJsonPath)
}

/**
 * Install packages
 * @param packages
 * @returns
 */
export function installPackages() {
  const deps = process.env.DEPENDENCIES || ''
  if (!deps) {
    return
  }

  const flags = Config.NPM_INSTALL_FLAGS
  logger.info('run command: ', `npm install ${deps} ${flags}`)
  const r = execSync(`npm install ${deps} ${flags}`)
  console.log(r.toString())
}

/**
 * Check if node module exists
 * @param moduleName
 * @returns
 */
export function moduleExists(mod: string) {
  try {
    require.resolve(mod)
    return true
  } catch (_err) {
    return false
  }
}

/**
 * Create necessary indexes of collections
 * @param data
 * @returns
 */
export async function ensureCollectionIndexes(): Promise<any> {
  // init.ts should not import db globally, because init.ts would be referenced in build time
  const { DatabaseAgent } = require('./db')
  await DatabaseAgent.accessor.ready
  const db = DatabaseAgent.db
  await db.collection(Constants.function_log_collection).createIndexes([
    {
      key: { created_at: 1 },
      expireAfterSeconds: Config.FUNCTION_LOG_EXPIRED_TIME,
    },
  ])

  return true
}