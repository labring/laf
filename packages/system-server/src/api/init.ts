import { ObjectId } from "mongodb"
import Config from "../config"
import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import { hashPassword } from "../utils/hash"
import { ApplicationStruct, getApplicationByAppid, publishApplicationPackages } from "./application"
import { ApplicationService } from "./service"
import * as fs from "fs"
import { ApplicationImporter } from "../lib/importer"
import { publishFunctions } from "./function"
import { publishAccessPolicies } from "./policy"

/**
 * Initialize APIs
 */
export class InitializerApi {

  static ready() {
    const sys_accessor = DatabaseAgent.sys_accessor
    return sys_accessor.ready
  }

  /**
   * Create system db collection indexes
   */
  static async createSystemCollectionIndexes() {
    const db = DatabaseAgent.db
    await db.collection(Constants.cn.accounts).createIndex('username', { unique: true })
    await db.collection(Constants.cn.applications).createIndex('appid', { unique: true })
    await db.collection(Constants.cn.functions).createIndex({ appid: 1, name: 1 }, { unique: true })
    await db.collection(Constants.cn.policies).createIndex({ appid: 1, name: 1 }, { unique: true })
  }


  /**
   * create root account
   * @returns account id
   */
  static async createRootAccount() {
    const db = DatabaseAgent.db
    const username = Config.INIT_ROOT_ACCOUNT
    const password = Config.INIT_ROOT_ACCOUNT_PASSWORD

    // add account
    const r = await db.collection(Constants.cn.accounts)
      .insertOne({
        username,
        quota: {
          app_count: Config.ACCOUNT_DEFAULT_APP_QUOTA
        },
        name: 'root',
        type: 'root',
        password: hashPassword(password),
        created_at: new Date(),
        updated_at: new Date()
      })

    return r.insertedId
  }

  /**
   * create system server app
   * @param account_id 
   * @param appid 
   * @returns app _id
   */
  static async createSystemApp(account_id: ObjectId, appid: string) {
    const SYSTEM_APP_NAME = 'laf.js system server app'
    const db = DatabaseAgent.db
    const db_config = DatabaseAgent.parseConnectionUri(Config.sys_db_uri)

    const data: ApplicationStruct = {
      name: SYSTEM_APP_NAME,
      created_by: account_id,
      appid: appid,
      status: 'created',
      collaborators: [],
      config: {
        db_name: db_config.database,
        db_user: db_config.username,
        db_password: db_config.password,
        server_secret_salt: Config.SYS_SERVER_SECRET_SALT
      },
      runtime: {
        image: Config.APP_SERVICE_IMAGE,
        metrics: {
          cpu_shares: 2048,
          memory: 1024
        }
      },
      buckets: [],
      packages: [],
      created_at: new Date(),
      updated_at: new Date()
    }

    // save it
    const ret = await db.collection(Constants.cn.applications)
      .insertOne(data as any)

    return ret.insertedId
  }

  /**
   * init system server app
   */
  static async initSystemApp(appid: string) {
    const app = await getApplicationByAppid(appid)
    const data = fs.readFileSync(Config.SYSTEM_SERVER_APP_PACKAGE)

    const importer = new ApplicationImporter(app, data)

    importer.parse()
    
    await importer.import()

    await publishFunctions(app)
    await publishAccessPolicies(app)
    await publishApplicationPackages(app.appid)
  }

  /**
   * start system server app
   * @param appid 
   * @returns container id
   */
  static async startSystemApp(appid: string) {
    const app = await getApplicationByAppid(appid)
    const container_id = await ApplicationService.start(app)

    return container_id
  }
}
