import { ObjectId } from "bson"
import { getAccountByUsername } from "./support/account"
import { getApplicationByAppid } from "./support/application"
import { Initializer } from "./support/initializer"
import Config from "./config"
import { logger } from "./support/logger"
import { createApplicationRoute } from "./support/route"


/**
 * x. create collection indexes
 * a. create root account if not exists
 * b. create & init`system-extension-server` for root account if not exists
 * c. start system server app if not running
 */
async function main() {
  await Initializer.ready()

  // create indexes
  await Initializer.createSystemCollectionIndexes()
  logger.info('create system collection indexes')

  // create root account
  let account_id: ObjectId
  const account = await getAccountByUsername(Config.INIT_ROOT_ACCOUNT)
  if (!account) {
    account_id = await Initializer.createRootAccount()
    logger.info('create root account')
  } else {
    account_id = account._id
  }

  // create app user policy
  await Initializer.initAppOSSUserPolicy()
  logger.info('init app user policy')


  if (await Initializer.createBuiltinSpecs()) {
    logger.info('create builtin specs')
  }

  // create system extension server app
  const app = await getApplicationByAppid(Config.SYSTEM_EXTENSION_APPID)
  if (!app) {
    await Initializer.createSystemExtensionApp(account_id, Config.SYSTEM_EXTENSION_APPID)
    logger.info('create system extension server app')
  }

  // run system extension server app
  await Initializer.startSystemExtensionApp(Config.SYSTEM_EXTENSION_APPID)
  logger.info('start system extension server app')

  // init system app route
  const finalApp = await getApplicationByAppid(Config.SYSTEM_EXTENSION_APPID)
  let rt = await createApplicationRoute(finalApp.name, finalApp.appid, 0)
  if (!rt) {
    logger.error('Error: create route failed')
  }


}


main().then(() => {
  process.exit(0)
})