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
import { CN_APPLICATIONS } from '../../constants'
import { DatabaseAgent } from '../../db'
import { ApplicationActionDef } from '../../actions'
import {deleteApplicationRoute} from "../../support/route";


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
  const code = await checkPermission(uid, ApplicationActionDef.DeleteApplication, app)
  if (code) {
    return res.status(code).send()
  }

  // i know that we just checked the permission, but also limit this permission to the owner.
  // just ignore the above permission checking, we will re-considered in future.
  if (uid !== app.created_by.toHexString()) {
    return res.status(403).send('only owner can remove application')
  }

  if (app.status !== 'stopped') {
    return res.status(400).send('you should stopped application instance before removing')
  }

  // save app to recycle collection
  const recycle = new RecycleCollector(CN_APPLICATIONS)
  const saved = await recycle.insert(app)
  assert.ok(saved, 'recycle insert got empty return value')

  // remove app
  const db = DatabaseAgent.db
  const ret = await db.collection(CN_APPLICATIONS)
    .deleteOne({ appid })

  // remote route
  await deleteApplicationRoute(app.appid)
  return res.send({ data: ret })
}