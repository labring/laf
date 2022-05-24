/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-28 22:00:45
 * @LastEditTime: 2022-02-06 00:29:12
 * @Description: Application APIs
 */

import { CN_APPLICATIONS } from "./constants"
import { DatabaseAgent } from "./db"
import { ObjectId } from 'mongodb'
import Config from "../config"
import * as mongodb_uri from 'mongodb-uri'

export enum BUCKET_ACL {
  private = 'private',
  readonly = 'public-read',
  public = 'public-read-write'
}

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
 * Get application list in pointed status
 * @param status 
 * @returns 
 */
export async function getApplicationsInStatus(status: InstanceStatus) {
  const db = DatabaseAgent.db
  const docs = await db.collection<IApplicationData>(CN_APPLICATIONS)
    .find({ status: status })
    .toArray()

  return docs
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