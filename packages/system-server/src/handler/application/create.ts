/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2022-01-31 23:44:45
 * @Description: 
 */

import * as assert from 'assert'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { getAccountById } from '../../support/account'
import { ApplicationStruct, createApplicationDb, generateAppid, getApplicationByAppid, getMyApplications } from '../../support/application'
import { MinioAgent } from '../../support/oss'
import Config from '../../config'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../db'
import { logger } from '../../logger'
import { generatePassword } from '../../support/util-passwd'

/**
 * The handler of creating application
 */
export async function handleCreateApplication(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const db = DatabaseAgent.db

  // check the application quota in account
  const account = await getAccountById(uid)
  assert.ok(account, 'empty account got')
  const app_quota = account.quota?.app_count ?? 0
  const my_apps = await getMyApplications(uid)
  if (my_apps.length >= app_quota) {
    return res.send({
      code: 'MEET_APPLICATION_QUOTA_LIMIT',
      error: 'you have not more quota to create application'
    })
  }

  // build the application config
  const app_name = req.body?.name ?? 'default'
  const appid = generateAppid()
  const _salt = generatePassword(6, true, false)
  const db_name = `app_${appid}_${_salt}`
  const db_user = db_name
  const db_password = generatePassword(32, true, false)

  const now = new Date()
  const data: ApplicationStruct = {
    name: app_name,
    created_by: new ObjectId(uid),
    appid: appid,
    status: 'created',
    collaborators: [],
    config: {
      db_name: db_name,
      db_user: db_user,
      db_password: db_password,
      server_secret_salt: generatePassword(64),
      oss_access_secret: generatePassword(64, true, false)
    },
    runtime: {
      image: Config.APP_SERVICE_IMAGE,
      resources: {
        req_cpu: Config.APP_DEFAULT_RESOURCES.req_cpu,
        req_memory: Config.APP_DEFAULT_RESOURCES.req_memory,
        limit_cpu: Config.APP_DEFAULT_RESOURCES.limit_cpu,
        limit_memory: Config.APP_DEFAULT_RESOURCES.limit_memory,
      }
    },
    buckets: [],
    packages: [],
    created_at: now,
    updated_at: now
  }

  // create oss user
  const oss = await MinioAgent.New()
  if (false === await oss.createUser(data.appid, data.config.oss_access_secret)) {
    return res.status(400).send('Error: create oss user failed')
  }
  if (false === await oss.setUserPolicy(data.appid, Config.MINIO_CONFIG.user_policy)) {
    return res.status(400).send('Error: set policy to oss user failed')
  }

  // save it
  const ret = await db.collection(Constants.colls.applications)
    .insertOne(data as any)

  if (!ret.insertedId) {
    return res.status(400).send('Error: create application failed')
  }

  // create app db
  const result = await createApplicationDb(data)
  logger.debug(`create application db ${db_name}`, result)

  const app = await getApplicationByAppid(appid)

  return res.send({
    data: app
  })
}