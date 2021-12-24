import { ObjectId } from "bson"
import { getAccountByUsername } from "./api/account"
import { getApplicationByAppid } from "./api/application"
import { InitializerApi } from "./api/init"
import Config from "./config"
import { logger } from "./lib/logger"

const SYSTEM_APPID = `00000000-0000-0000-0000-000000000000`

/**
 * x. create collection indexes
 * a. create root account if not exists
 * b. create & init`system-server` for root account if not exists
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

  // create system server app
  const app = await getApplicationByAppid(SYSTEM_APPID)
  if (!app) {
    await InitializerApi.createSystemApp(account_id, SYSTEM_APPID)
    logger.info('create system server app')

    await InitializerApi.initSystemApp(SYSTEM_APPID)
    logger.info('init system server app')
  }

  // run system server app
  await InitializerApi.startSystemApp(SYSTEM_APPID)
  logger.info('start system server app')
}


main().then(() => {
  process.exit(0)
})