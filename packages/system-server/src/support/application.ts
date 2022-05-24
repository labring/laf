/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-28 22:00:45
 * @LastEditTime: 2022-02-06 00:29:12
 * @Description: Application APIs
 */

import { CN_APPLICATIONS, CN_APP_SPECS, CN_PUBLISHED_CONFIG } from "../constants"
import { DatabaseAgent } from "../db"
import * as assert from 'assert'
import { MongoAccessor } from "database-proxy"
import { MongoClient, ObjectId } from 'mongodb'
import Config from "../config"
import * as mongodb_uri from 'mongodb-uri'
import { logger } from "./logger"
import { BUCKET_ACL } from "./minio"
import { customAlphabet } from 'nanoid'
import { Admin } from "../groups"

/**
 * Status of application instance
 */
export enum InstanceStatus {
  CREATED = 'created',
  PREPARED_START = 'prepared_start',
  STARTING = 'starting',
  RUNNING = 'running',
  PREPARED_STOP = 'prepared_stop',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  PREPARED_RESTART = 'prepared_restart',
  RESTARTING = 'restarting'
}

export interface IApplicationBucket {
  name: string,
  mode: BUCKET_ACL,
  quota: number,
  options?: {
    index: string | null
    domain: string
  }
}

/**
 * The application structure in db
 */
export interface IApplicationData {
  _id?: string
  name: string
  created_by: ObjectId
  appid: string
  status: InstanceStatus
  config: {
    db_server_name?: string
    db_name: string
    db_user: string
    db_password: string
    server_secret_salt: string
    oss_access_secret: string
  }
  runtime: {
    image: string
  }
  buckets: IApplicationBucket[]
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
 * Update application status
 * @param appid 
 * @param from original status
 * @param to target status to update
 * @returns 
 */
export async function updateApplicationStatus(appid: string, from: InstanceStatus, to: InstanceStatus) {
  const db = DatabaseAgent.db
  const r = await db.collection<IApplicationData>(CN_APPLICATIONS)
    .updateOne({
      appid: appid,
      status: from,
    }, {
      $set: {
        status: to
      }
    })

  return r.modifiedCount
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
    .aggregate([
      { $match: { created_by: new ObjectId(account_id) } },
      { $unset: ['config'] },
      {
        $lookup: {
          from: CN_APP_SPECS,
          localField: 'appid',
          foreignField: 'appid',
          as: 'spec'
        }
      },
      { $unwind: { path: '$spec' } }
    ]).toArray()

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
    .aggregate([
      { $match: { 'collaborators.uid': new ObjectId(account_id) } },
      { $unset: ['config'] },
      {
        $lookup: {
          from: CN_APP_SPECS,
          localField: 'appid',
          foreignField: 'appid',
          as: 'spec'
        }
      },
      { $unwind: { path: '$spec' } }
    ]).toArray()

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
export function getUserGroupsOfApplication(uid: string, app: IApplicationData) {
  if (app.created_by.toHexString() === uid) {
    return [Admin.name]
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


const generate_appid = customAlphabet('23456789abcdefghijklmnopqrstuvwxyz', Config.APPID_LENGTH)

/**
 * Generate application id :
 * - lower case
 * - without "1" and "2"
 * - alpha & numbers
 * @returns 
 */
export async function tryGenerateUniqueAppid() {
  const db = DatabaseAgent.db
  let appid: string
  for (let i = 0; i < 10; i++) {
    appid = generate_appid()
    const total = await db.collection<IApplicationData>(CN_APPLICATIONS).countDocuments({ appid: appid })
    if (total === 0) break
    appid = null
  }

  if (!appid) throw new Error('try to genereate appid failed')
  return appid
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