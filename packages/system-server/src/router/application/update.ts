/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-09-08 03:32:57
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid } from '../../api/application'
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
  const db = DatabaseAgent.sys_db
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

  const ret = await db.collection(Constants.cn.applications)
    .where({ appid: app.appid })
    .update({ name: body.name })

  return res.send({
    data: ret
  })
}