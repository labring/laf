import { ensureCollectionIndexes, getExtraPackages, initCloudSdkPackage, installPackages, moduleExists } from "./api/init"
import { logger } from "./lib/logger"


async function main() {
  initCloudSdkPackage()
  
  const packages = await getExtraPackages()
  if (!packages.length) {
    logger.info('no extra packages found')
    return 0
  }

  logger.info('packages loaded: ', packages)

  const not_exists = packages.filter(pkg => !moduleExists(pkg.name))
  if (!not_exists.length) {
    logger.info('no new packages to be installed')
    return 0
  }

  try {
    const res = installPackages(packages)
    logger.info(res)

    initCloudSdkPackage()

    await ensureCollectionIndexes()
  } catch (error) {
    logger.error(error)
    return 1
  }

  return 0
}


main().then(code => {
  process.exit(code)
})