/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-09-10 01:07:11
 * @Description: 
 */

import * as assert from 'assert'
import { Request, Response } from 'express'
import { RecycleCollector } from '../../api/recycle'
import { getApplicationByAppid } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../lib/db-agent'

const { APPLICATION_REMOVE } = Constants.permissions

/**
 * The handler of removing application
 * @param req 
 * @param res 
 * @returns 
 */
export async function handleRemoveApplication(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('invalid appid')

  if (app.status !== 'cleared' && app.status !== 'created') {
    return res.status(422).send('app status must be cleared or created')
  }

  // check permission
  const code = await checkPermission(uid, APPLICATION_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // i know that we just checked the permission, but also limit this permission to the owner.
  // just ignore the above permission checking, we will re-considered in future.
  if (uid !== app.created_by) {
    return res.status(403).send('only owner can remove application')
  }

  // save app to recycle collection
  const recycle = new RecycleCollector(Constants.cn.applications)
  const saved = await recycle.insert(app)
  assert.ok(saved, 'recycle insert got empty return value')

  // remove app
  const db = DatabaseAgent.sys_db
  const ret = await db.collection(Constants.cn.applications)
    .where({ appid })
    .remove()

  return res.send({ data: ret })
}