import { ObjectId } from "bson"
import { getAccountByUsername } from "./support/account"
import { getApplicationByAppid } from "./support/application"
import { InitializerApi } from "./support/init"
import Config from "./config"
import { Constants } from "./constants"
import { logger } from "./logger"

const SYSTEM_EXTENSION_APPID = Constants.SYSTEM_EXTENSION_APPID

/**
 * x. create collection indexes
 * a. create root account if not exists
 * b. create & init`system-extension-server` for root account if not exists
 * c. start system server app if not running
 */
async function main() {
  await InitializerApi.ready()

  // create indexes
  await InitializerApi.createSystemCollectionIndexes()
  logger.info('create system collection indexes')

  // create root account
  let account_id: ObjectId
  const account = await getAccountByUsername(Config.INIT_ROOT_ACCOUNT)
  if (!account) {
    account_id = await InitializerApi.createRootAccount()
    logger.info('create root account')
  } else {
    account_id = account._id
  }

  // create app user policy
  await InitializerApi.initAppOSSUserPolicy()
  logger.info('init app user policy')


  if (await InitializerApi.createBuiltinSpecs()) {
    logger.info('create builtin specs')
  }

  // create system extension server app
  const app = await getApplicationByAppid(SYSTEM_EXTENSION_APPID)
  if (!app) {
    await InitializerApi.createSystemExtensionApp(account_id, SYSTEM_EXTENSION_APPID)
    logger.info('create system extension server app')
  }

  // run system extension server app
  await InitializerApi.startSystemExtensionApp(SYSTEM_EXTENSION_APPID)
  logger.info('start system extension server app')
}


main().then(() => {
  process.exit(0)
})