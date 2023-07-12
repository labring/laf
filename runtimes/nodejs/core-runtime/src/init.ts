import { execSync } from 'child_process'
import Config from './config'

import { logger } from './support/logger'

async function main() {
  try {
    installPackages()
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

/**
 * Install packages
 * @param packages
 * @returns
 */
export function installPackages() {
  const deps = process.env.DEPENDENCIES
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
