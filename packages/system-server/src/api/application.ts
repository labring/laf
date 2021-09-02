/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-28 22:00:45
 * @LastEditTime: 2021-09-02 16:12:47
 * @Description: Application APIs
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import * as assert from 'assert'
import { MongoAccessor } from "less-api/dist"
import * as crypto from 'crypto'

/**
 * The application structure in db
 */
export interface ApplicationStruct {
  _id?: string
  name: string
  created_by: string
  appid: string
  app_secret: string
  status: 'created' | 'starting' | 'running' | 'stopped'
  config: {
    db_name: string
    db_uri: string
    db_max_pool_size: number
    server_secret_salt: string
    file_system_driver?: string
    file_system_enable_unauthorized_upload?: string
    file_system_http_cache_control?: string
    log_level?: string
    enable_cloud_function_log?: string
  }
  collaborators: {
    uid: string
    roles: string[]
    created_at: number
  }[]
  created_at?: number
  updated_at?: number
}

/**
 * Get an application created by account_id
 */
export async function getApplicationByAppid(appid: string) {
  if (!appid) return null

  const db = DatabaseAgent.sys_db
  const ret = await db.collection(Constants.cn.applications)
    .where({ appid: appid })
    .field({
      app_secret: false,
      config: false
    })
    .getOne<ApplicationStruct>()

  assert.ok(ret.ok, `getMyApplicationById() got error: ${appid}`)
  return ret.data
}

/**
 * Get application created by account_id
 * @param account_id 
 * @returns applications' data array
 */
export async function getMyApplications(account_id: string) {
  assert.ok(account_id, 'empty account_id got')

  const db = DatabaseAgent.sys_db
  const ret = await db.collection(Constants.cn.applications)
    .where({ created_by: account_id })
    .field({
      config: false
    })
    .get<ApplicationStruct>()

  assert.ok(ret.ok, `getMyApplications() got error: ${account_id}`)
  return ret.data
}

/**
 * Get applications of account_id joined
 * @param account_id 
 * @returns 
 */
export async function getMyJoinedApplications(account_id: string) {
  assert.ok(account_id, 'empty account_id got')

  const db = DatabaseAgent.sys_db
  const ret = await db.collection(Constants.cn.applications)
    .where({
      'collaborators.uid': account_id
    })
    .get<ApplicationStruct>()

  assert.ok(ret.ok, `getMyApplications() got error: ${account_id}`)
  return ret.data
}


/**
 * Get application database connection & ORM instance
 * @param app 
 * @returns 
 */
export async function getApplicationDbAccessor(app: ApplicationStruct) {
  const db_name = app.config.db_name
  const db_uri = app.config.db_uri

  assert.ok(db_name)
  assert.ok(db_uri)
  const accessor = new MongoAccessor(db_name, db_uri, { directConnection: true })
  await accessor.init()

  return accessor
}

/**
 * Generate application secret string
 * @returns 
 */
export async function generateApplicationSecret() {
  const buf = crypto.randomBytes(64)
  return buf.toString('base64')
}

/**
 * Generate application id
 * @returns 
 */
export function generateApplicationId() {
  return crypto.randomUUID()
}