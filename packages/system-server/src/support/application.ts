/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-28 22:00:45
 * @LastEditTime: 2022-02-06 00:29:12
 * @Description: Application APIs
 */

import { CN_APPLICATIONS, CN_PUBLISHED_CONFIG, CONST_DICTS } from "../constants"
import { DatabaseAgent } from "../db"
import * as assert from 'assert'
import { MongoAccessor } from "database-proxy"
import { generateUUID } from "./util-passwd"
import { MongoClient, ObjectId } from 'mongodb'
import Config from "../config"
import * as mongodb_uri from 'mongodb-uri'
import { logger } from "./logger"
import { BUCKET_ACL } from "./minio"

/**
 * The application structure in db
 */
export interface IApplicationData {
  _id?: string
  name: string
  created_by: ObjectId
  appid: string
  status: 'created' | 'running' | 'stopped' | 'cleared'
  config: {
    db_server_name?: string
    db_name: string
    db_user: string
    db_password: string
    server_secret_salt: string
    oss_access_secret: string
    file_system_driver?: string
    file_system_enable_unauthorized_upload?: string
    file_system_http_cache_control?: string
    log_level?: string
    enable_cloud_function_log?: string
  }
  runtime: {
    image: string
  }
  buckets: {
    name: string,
    mode: BUCKET_ACL,
    quota: number
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
  const doc = await db.collection<IApplicationData>(CN_APPLICATIONS)
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
  const docs = await db.collection<IApplicationData>(CN_APPLICATIONS)
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
  const docs = await db.collection<IApplicationData>(CN_APPLICATIONS)
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
export async function getApplicationDbAccessor(app: IApplicationData) {
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
export function getUserRolesOfApplication(uid: string, app: IApplicationData) {
  if (app.created_by.toHexString() === uid) {
    return [CONST_DICTS.roles.owner.name]
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
export function getApplicationDbUri(app: IApplicationData) {
  const { db_name, db_password, db_user } = app.config

  // build app db connection uri from config
  const parsed = mongodb_uri.parse(Config.APP_DB_URI)
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
export async function createApplicationDb(app: IApplicationData) {
  const client = new MongoClient(Config.APP_DB_URI)
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
      const app_coll = db.collection(CN_PUBLISHED_CONFIG)
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