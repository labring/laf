import { ObjectId } from "mongodb"
import Config from "../config"
import { Constants } from "../constants"
import { DatabaseAgent } from "../db"
import { hashPassword, generatePassword } from "./util-passwd"
import { ApplicationStruct, getApplicationByAppid } from "./application"
import { ApplicationService } from "./service"
import * as path from 'path'
import { MinioAgent } from "./oss"

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
    await db.collection(Constants.colls.accounts).createIndex('username', { unique: true })
    await db.collection(Constants.colls.applications).createIndex('appid', { unique: true })
    await db.collection(Constants.colls.functions).createIndex({ appid: 1, name: 1 }, { unique: true })
    await db.collection(Constants.colls.policies).createIndex({ appid: 1, name: 1 }, { unique: true })
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
    const r = await db.collection(Constants.colls.accounts)
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
   * create system extension server app
   * @param account_id 
   * @param appid 
   * @returns app _id
   */
  static async createSystemExtensionApp(account_id: ObjectId, appid: string) {
    const SYSTEM_APP_NAME = 'System Extension Server'
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
        server_secret_salt: Config.SYS_SERVER_SECRET_SALT,
        oss_access_secret: generatePassword(64, true, false)
      },
      runtime: {
        image: Config.APP_SERVICE_IMAGE,
        resources: {
          req_cpu: '100',
          req_memory: '256',
          limit_cpu: '1000',
          limit_memory: '1024'
        }
      },
      buckets: [],
      packages: [],
      created_at: new Date(),
      updated_at: new Date()
    }

    // create oss user
    const oss = await MinioAgent.New()
    if (false === await oss.createUser(data.appid, data.config.oss_access_secret)) {
      throw new Error('create oss user failed')
    }
    if (false === await oss.setUserPolicy(data.appid, Config.MINIO_CONFIG.user_policy)) {
      throw new Error('set policy to oss user failed')
    }

    // save it
    const ret = await db.collection(Constants.colls.applications)
      .insertOne(data as any)

    return ret.insertedId
  }

  /**
   * start system extension server app
   * @param appid 
   * @returns container id
   */
  static async startSystemExtensionApp(appid: string) {
    const app = await getApplicationByAppid(appid)
    await ApplicationService.start(app)
  }

  /**
   * create app user policy
   */
  static async initAppUserPolicy() {
    const oss = await MinioAgent.New()
    const policy_path = path.resolve(__dirname, '../../user-policy.json')
    await oss.createUserPolicy(Config.MINIO_CONFIG.user_policy, policy_path)
  }
}
