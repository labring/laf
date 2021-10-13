/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-10-08 01:25:43
 * @Description: 
 */

import * as assert from 'assert'
import { Request, Response } from 'express'
import { getAccountById } from '../../api/account'
import { ApplicationStruct, createApplicationDb, generateAppid, getMyApplications } from '../../api/application'
import { Constants } from '../../constants'
import { ErrorCodes } from '../../constants/error-code'
import { DatabaseAgent } from '../../lib/db-agent'
import { logger } from '../../lib/logger'
import { generatePassword } from '../../utils/rand'

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
    return res.send(ErrorCodes.MEET_APPLICATION_QUOTA_LIMIT)
  }

  // build the application config
  const app_name = req.body?.name ?? 'default'
  const appid = generateAppid()
  const _salt = generatePassword(6, true, false)
  const db_name = `app_${appid}_${_salt}`
  const db_user = db_name
  const db_password = generatePassword(32, true, false)

  const now = Date.now()
  const data: ApplicationStruct = {
    name: app_name,
    created_by: uid,
    appid: appid,
    status: 'created',
    collaborators: [],
    config: {
      db_name: db_name,
      db_user: db_user,
      db_password: db_password,
      server_secret_salt: generatePassword(64),
    },
    created_at: now,
    updated_at: now
  }

  // save it
  const ret = await db.collection(Constants.cn.applications)
    .insertOne(data as any)

  if (!ret.insertedId) {
    return res.status(400).send('failed to create application')
  }

  // create app db
  const result = await createApplicationDb(data)
  logger.debug(`create application db ${db_name}`, result)

  return res.send({
    data: ret
  })
}