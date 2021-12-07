/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-12-07 13:55:45
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct, getApplicationByAppid } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../lib/db-agent'
import { permissions } from '../../constants/permissions'

const { APPLICATION_UPDATE } = permissions

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
  const code = await checkPermission(uid, APPLICATION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check params
  const body = req.body
  if (!body.name) return res.status(422).send('name cannot be empty')

  const ret = await db.collection<ApplicationStruct>(Constants.cn.applications)
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