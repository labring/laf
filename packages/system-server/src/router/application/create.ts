/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-09-03 19:07:51
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct, createApplicationDb, generateAppid } from '../../api/application'
import { Constants } from '../../constants'
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

  const app_name = req.body?.name ?? 'default'
  const db = DatabaseAgent.sys_db

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

  const ret = await db.collection(Constants.cn.applications)
    .add(data)

  if (!ret.id) {
    return res.status(400).send('failed to create application')
  }

  const result = await createApplicationDb(data)
  logger.debug(`create application db ${db_name}`, result)

  return res.send({
    data: ret
  })
}