/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-08-31 15:46:15
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct, generateApplicationSecret } from '../../api/application'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../lib/db-agent'

/**
 * The handler of creating application
 */
export async function handleCreateApplication(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const app_name = req.body?.name ?? 'default'

  const db = DatabaseAgent.sys_db

  const app_secret = await generateApplicationSecret()
  const now = Date.now()
  const data: ApplicationStruct = {
    name: app_name,
    created_by: uid,
    app_secret: app_secret,
    status: 'created',
    collaborators: [],
    config: {
      db_name: null,
      db_uri: null,
      db_max_pool_size: 10,
      server_secret_salt: app_secret,
    },
    created_at: now,
    updated_at: now
  }

  const ret = await db.collection(Constants.cn.applications)
    .add(data)

  return res.send({
    data: ret
  })
}