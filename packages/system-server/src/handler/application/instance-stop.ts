/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-12-24 11:57:45
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid, InstanceStatus, updateApplicationStatus } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { ApplicationActionDef } from '../../actions'


/**
 * The handler of stopping application
 */
export async function handleStopInstance(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, ApplicationActionDef.StopInstance, app)
  if (code)
    return res.status(code).send()

  const ret = await updateApplicationStatus(app.appid, app.status, InstanceStatus.PREPARED_STOP)
  return res.send({
    data: {
      result: ret > 0 ? true : false,
      appid: app.appid
    }
  })
}
