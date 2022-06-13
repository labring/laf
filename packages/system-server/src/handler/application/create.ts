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
import { IApplicationData, createApplicationDb, tryGenerateUniqueAppid, getApplicationByAppid, getMyApplications, InstanceStatus } from '../../support/application'
import { MinioAgent } from '../../support/minio'
import Config from '../../config'
import { CN_APPLICATIONS, DATE_NEVER } from '../../constants'
import { DatabaseAgent } from '../../db'
import { logger } from '../../support/logger'
import { generatePassword } from '../../support/util-passwd'
import { ApplicationSpecSupport } from '../../support/application-spec'
import {createApplicationRoute} from "../../support/route";

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

  // check the spec
  const spec_name = req.body?.spec
  const spec = await ApplicationSpecSupport.getSpec(spec_name)
  if (!spec || !spec?.enabled) {
    return res.send({
      code: 'INVALID_SPEC_NAME',
      error: 'spec name is not avaliable'
    })
  }

  // build the application config
  const app_name = req.body?.name ?? 'default'
  const appid = await tryGenerateUniqueAppid()
  const _salt = generatePassword(6, true, false)
  const db_name = `app_${appid}_${_salt}`
  const db_user = db_name
  const db_password = generatePassword(32, true, false)

  const now = new Date()
  const data: IApplicationData = {
    name: app_name,
    created_by: new ObjectId(uid),
    appid: appid,
    status: InstanceStatus.CREATED,
    collaborators: [],
    config: {
      db_name: db_name,
      db_user: db_user,
      db_password: db_password,
      server_secret_salt: generatePassword(64, true, false),
      oss_access_secret: generatePassword(64, true, false)
    },
    runtime: {
      image: Config.APP_SERVICE_IMAGE
    },
    buckets: [],
    packages: [],
    created_at: now,
    updated_at: now
  }

  // assign spec to app
  const assigned = await ApplicationSpecSupport.assign(appid, spec.name, new Date(), DATE_NEVER)
  if (!assigned.insertedId) {
    return res.status(400).send('Error: assign spec to app failed')
  }

  // create oss user
  {
    const oss = await MinioAgent.New()
    const r0 = await oss.createUser(data.appid, data.config.oss_access_secret)
    if (r0.status === 'error') {
      logger.error(r0.error)
      return res.status(400).send('Error: create oss user failed')
    }
    const r1 = await oss.setUserPolicy(data.appid, Config.MINIO_CONFIG.user_policy)
    if (r1.status === 'error') {
      logger.error(r1.error)
      return res.status(400).send('Error: set policy to oss user failed')
    }
  }

  // save it
  const ret = await db.collection(CN_APPLICATIONS)
    .insertOne(data as any)

  if (!ret.insertedId) {
    return res.status(400).send('Error: create application failed')
  }

  // create app db
  const result = await createApplicationDb(data)
  logger.debug(`create application db ${db_name}`, result)

  const app = await getApplicationByAppid(appid)

  let rt = await createApplicationRoute(data.name, data.appid, uid)
  if (!rt) {
      return res.status(400).send('Error: create route failed')
  }

  return res.send({
    data: app
  })
}