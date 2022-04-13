/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-28 22:00:45
 * @LastEditTime: 2022-02-06 00:29:12
 * @Description: Application APIs
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import * as assert from 'assert'
import { MongoAccessor } from "database-proxy"
import { generateUUID } from "../utils/rand"
import { MongoClient, ObjectId } from 'mongodb'
import Config from "../config"
import * as mongodb_uri from 'mongodb-uri'
import { BucketMode } from "./storage"
import { logger } from "../lib/logger"
import { BUCKET_ACL } from "./oss"

/**
 * The application structure in db
 */
export interface ApplicationStruct {
  _id?: string
  name: string
  created_by: ObjectId
  appid: string
  status: 'created' | 'running' | 'stopped' | 'cleared'
  config: {
    db_name: string
    db_user: string
    db_password: string
    server_secret_salt: string
    file_system_driver?: string
    file_system_enable_unauthorized_upload?: string
    file_system_http_cache_control?: string
    log_level?: string
    enable_cloud_function_log?: string
  }
  runtime: {
    image: string
    /** @deprecated use `resources` instead, will be removed in future */
    metrics?: {
      cpu_shares?: number
      memory?: number
    },
    resources: {
      /** `requests.cpu` in kubernetes, in millicores.  ex. `1000` for 1 cpu, `100` for 0.1 cpu.  */
      req_cpu: string,
      /** `requests.memory` in kubernetes, in Mib. */
      req_memory: string,
      /** `limits.cpu` in kubernetes, also valid for docker cpu shares. In millicores.  ex. `1000` for 1 cpu, `100` for 0.1 cpu. */
      limit_cpu: string,
      /** `limits.memory` in kubernetes, also valid for docker memory limit, in Mib. */
      limit_memory: string
    }
  }
  buckets: {
    name: string,
    mode: BucketMode | BUCKET_ACL
  }[]
  packages: {
    name: string,
    version: string
  }[]
  collaborators: {
    uid: ObjectId
    roles: string[]
    created_at: number
  }[]
  created_at?: Date
  updated_at?: Date
}

/**
 * Get an application created by account_id
 */
export async function getApplicationByAppid(appid: string) {
  if (!appid) return null

  const db = DatabaseAgent.db
  const doc = await db.collection<ApplicationStruct>(Constants.cn.applications)
    .findOne({ appid: appid })

  return doc
}

/**
 * Get application created by account_id
 * @param account_id 
 * @returns applications' data array
 */
export async function getMyApplications(account_id: string) {
  assert.ok(account_id, 'empty account_id got')

  const db = DatabaseAgent.db
  const docs = await db.collection<ApplicationStruct>(Constants.cn.applications)
    .find({ created_by: new ObjectId(account_id) }, {
      projection: { config: false }
    }).toArray()

  return docs
}

/**
 * Get applications of account_id joined
 * @param account_id 
 * @returns 
 */
export async function getMyJoinedApplications(account_id: string) {
  assert.ok(account_id, 'empty account_id got')

  const db = DatabaseAgent.db
  const docs = await db.collection<ApplicationStruct>(Constants.cn.applications)
    .find({
      'collaborators.uid': new ObjectId(account_id)
    }).toArray()

  return docs
}


/**
 * Get application database connection & ORM instance
 * @param app 
 * @returns 
 */
export async function getApplicationDbAccessor(app: ApplicationStruct) {
  const { db_name, db_password, db_user } = app.config
  assert.ok(db_name, 'empty db_name got')
  assert.ok(db_password, 'empty db_password got')
  assert.ok(db_user, 'empty db_user got')

  const db_uri = getApplicationDbUri(app)
  const accessor = new MongoAccessor(db_name, db_uri)
  await accessor.init()

  return accessor
}


/**
 * Get user's roles of an application
 * @param uid 
 * @param app 
 * @returns 
 */
export function getUserRolesOfApplication(uid: string, app: ApplicationStruct) {
  if (app.created_by.toHexString() === uid) {
    return [Constants.roles.owner.name]
  }

  // reject if not the collaborator
  const [found] = app.collaborators.filter(co => co.uid.toHexString() === uid)
  if (!found) {
    return []
  }

  return found.roles
}

/**
 * Get the db uri of an application
 * @param app 
 * @returns 
 */
export function getApplicationDbUri(app: ApplicationStruct) {
  const { db_name, db_password, db_user } = app.config

  // build app db connection uri from config
  const parsed = mongodb_uri.parse(Config.app_db_uri)
  parsed.database = db_name
  parsed.username = db_user
  parsed.password = db_password
  parsed.options['authSource'] = db_name

  return mongodb_uri.format(parsed)
}

/**
 * Create application db
 * @param app
 */
export async function createApplicationDb(app: ApplicationStruct) {
  const client = new MongoClient(Config.app_db_uri)
  await client.connect()
  const { db_name, db_user, db_password } = app.config
  const db = client.db(db_name)
  const result = await db.addUser(db_user, db_password, {
    roles: [
      { role: "readWrite", db: db_name },
      { role: "dbAdmin", db: db_name }
    ]
  })

  await client.close()
  return result
}

/**
 * Generate application id
 * @returns 
 */
export function generateAppid() {
  return generateUUID()
}

/**
 * Publish application packages
 * @param app 
 * @returns 
 */
export async function publishApplicationPackages(appid: string) {
  const app = await getApplicationByAppid(appid)

  // write packages to app db
  const app_accessor = await getApplicationDbAccessor(app)
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const db = app_accessor.db
      const app_coll = db.collection(Constants.config_collection)
      await app_coll.deleteOne({ key: 'packages' }, { session })

      const packages = app.packages
      if (packages?.length) {
        await app_coll.insertOne({
          key: 'packages', value: packages
        }, { session })
      }
    })
  } catch (error) {
    logger.error(error)
  } finally {
    await session.endSession()
    await app_accessor.close()
  }
}