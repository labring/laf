import {
  ensureCollectionIndexes,
  initCloudSdkPackage,
  installPackages,
} from './support/init'
import { logger } from './support/logger'

async function main() {
  try {
    installPackages()

    initCloudSdkPackage()
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
