import { ObjectId } from "mongodb"
import Config from "../config"
import { CN_ACCOUNTS, CN_APPLICATIONS, CN_FUNCTIONS, CN_POLICIES, CN_SPECS, DATE_NEVER, GB, MB } from "../constants"
import { DatabaseAgent } from "../db"
import { hashPassword, generatePassword } from "./util-passwd"
import { IApplicationData, getApplicationByAppid, InstanceStatus, updateApplicationStatus } from "./application"
import * as path from 'path'
import { MinioAgent } from "./minio"
import { ApplicationSpecSupport } from "./application-spec"

/**
 * Initialize APIs
 */
export class Initializer {

  static ready() {
    const sys_accessor = DatabaseAgent.sys_accessor
    return sys_accessor.ready
  }

  /**
   * Create system db collection indexes
   */
  static async createSystemCollectionIndexes() {
    const db = DatabaseAgent.db
    await db.collection(CN_ACCOUNTS).createIndex('username', { unique: true })
    await db.collection(CN_APPLICATIONS).createIndex('appid', { unique: true })
    await db.collection(CN_FUNCTIONS).createIndex({ appid: 1, name: 1 }, { unique: true })
    await db.collection(CN_POLICIES).createIndex({ appid: 1, name: 1 }, { unique: true })
    await db.collection(CN_SPECS).createIndex({ name: 1 }, { unique: true })
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
    const r = await db.collection(CN_ACCOUNTS)
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
   * Create builtin spec
   * @returns false if spec already existed 
   */
  static async createBuiltinSpecs() {
    const spec = await ApplicationSpecSupport.getSpec('starter')
    if (spec) {
      return false
    }
    const res = await ApplicationSpecSupport.createSpec({
      name: 'starter',
      label: 'Starter',
      request_cpu: 50,
      request_memory: 64 * MB,
      limit_cpu: 1000,
      limit_memory: 256 * MB,
      database_capacity: 2 * GB,
      storage_capacity: 5 * GB,
      bandwith: 10 * MB,
      out_traffic: 5 * GB,
      priority: 0,
      enabled: true
    })

    return res.insertedId
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
    const db_config = DatabaseAgent.parseConnectionUri(Config.SYS_DB_URI)

    const data: IApplicationData = {
      name: SYSTEM_APP_NAME,
      created_by: account_id,
      appid: appid,
      status: InstanceStatus.CREATED,
      collaborators: [],
      config: {
        db_name: db_config.database,
        db_user: db_config.username,
        db_password: db_config.password,
        server_secret_salt: Config.SYS_SERVER_SECRET_SALT,
        oss_access_secret: generatePassword(64, true, false)
      },
      runtime: {
        image: Config.APP_SERVICE_IMAGE
      },
      buckets: [],
      packages: [],
      created_at: new Date(),
      updated_at: new Date()
    }

    // create oss user
    const oss = await MinioAgent.New()
    const res0 = await oss.createUser(data.appid, data.config.oss_access_secret)
    if (res0.status === 'error') {
      throw new Error('create oss user failed:' + res0.error)
    }
    const res1 = await oss.setUserPolicy(data.appid, Config.MINIO_CONFIG.user_policy)
    if (res1.status === 'error') {
      throw new Error('set policy to oss user failed:' + res1.error)
    }

    // assign app spec
    const app_spec = await ApplicationSpecSupport.getValidAppSpec(appid)
    if (!app_spec) {
      await ApplicationSpecSupport.assign(appid, 'starter', new Date(), DATE_NEVER)
    }

    // save it
    const ret = await db.collection(CN_APPLICATIONS)
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
    await updateApplicationStatus(appid, app.status, InstanceStatus.PREPARED_START)
  }

  /**
   * create app user policy
   */
  static async initAppOSSUserPolicy() {
    const oss = await MinioAgent.New()
    const policy_path = path.resolve(__dirname, '../../user-policy.json')
    await oss.createUserPolicy(Config.MINIO_CONFIG.user_policy, policy_path)
  }
}
