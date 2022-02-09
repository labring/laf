import { ensureCollectionIndexes, getExtraPackages, initCloudSdkPackage, installPackages, moduleExists } from "./api/init"
import { logger } from "./lib/logger"


async function main() {
  const packages = await getExtraPackages()
  if (!packages.length) {
    logger.info('no extra packages found')
  }

  logger.info('packages loaded: ', packages)

  const not_exists = packages.filter(pkg => !moduleExists(pkg.name))
  if (packages.length && !not_exists.length) {
    logger.info('no new packages to be installed')
  }

  try {
    if (not_exists.length) {
      const res = installPackages(packages)
      logger.info(res)
    }

    initCloudSdkPackage()

    await ensureCollectionIndexes()
  } catch (error) {
    logger.error(error)
    return 1
  }

  return 0
}


main()
  .then(code => {
    process.exit(code)
  })
  .catch(err => {
    logger.error(err)
    process.exit(2)
  })