/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-12-07 13:55:45
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData, getApplicationByAppid } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { CN_APPLICATIONS } from '../../constants'
import { DatabaseAgent } from '../../db'
import { ApplicationActionDef } from '../../actions'


/**
 * The handler of updating application
 */
export async function handleUpdateApplication(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, ApplicationActionDef.UpdateApplication, app)
  if (code) {
    return res.status(code).send()
  }

  // check params
  const body = req.body
  if (!body.name) return res.status(422).send('name cannot be empty')

  const ret = await db.collection<IApplicationData>(CN_APPLICATIONS)
    .updateOne(
      { appid: app.appid },
      {
        $set: {
          name: body.name,
          updated_at: new Date()
        }
      }
    )

  return res.send({
    data: ret
  })
}