/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2022-01-19 14:48:50
 * @Description: 
 */

import * as assert from 'assert'
import { Request, Response } from 'express'
import { RecycleCollector } from '../../support/recycle'
import { getApplicationByAppid } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../db'
import { ApplicationService } from '../../support/service'

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

  if (app.status === 'running') {
    return res.status(422).send('you can not remove a running app')
  }

  // check permission
  const code = await checkPermission(uid, APPLICATION_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // i know that we just checked the permission, but also limit this permission to the owner.
  // just ignore the above permission checking, we will re-considered in future.
  if (uid !== app.created_by.toHexString()) {
    return res.status(403).send('only owner can remove application')
  }

  if (app.status !== 'stopped') {
    await ApplicationService.stop(app)
  }

  // save app to recycle collection
  const recycle = new RecycleCollector(Constants.colls.applications)
  const saved = await recycle.insert(app)
  assert.ok(saved, 'recycle insert got empty return value')

  // remove app
  const db = DatabaseAgent.db
  const ret = await db.collection(Constants.colls.applications)
    .deleteOne({ appid })

  return res.send({ data: ret })
}