/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2021-10-07 22:00:34
 * @Description: 
 */

import { Proxy, Policy } from 'database-proxy'
import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { permissions } from '../../constants/permissions'
import { Request, Response } from 'express'


/**
 * The less-api proxy entry for database management
 */
export async function handleDbProxy(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, permissions.DATABASE_MANAGE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)

  // don't need policy rules, open all collections' access permission for dbm use
  const entry = new Proxy(accessor, new Policy(accessor))

  // parse params
  const params = entry.parseParams(req.body)

  // execute query
  try {
    const data = await entry.execute(params)

    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error
    })
  }
}
