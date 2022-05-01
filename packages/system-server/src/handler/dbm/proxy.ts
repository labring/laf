/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2022-01-13 13:52:09
 * @Description: 
 */

import { Proxy, Policy } from 'database-proxy'
import { IApplicationData, getApplicationDbAccessor } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { permissions } from '../../permissions'
import { Request, Response } from 'express'


/**
 * The db proxy entry for database management
 */
export async function handleDbProxy(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, permissions.DATABASE_MANAGE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)

  // don't need policy rules, open all collections' access permission for dbm use
  const proxy = new Proxy(accessor, new Policy(accessor))

  // parse params
  const params = proxy.parseParams(req.body)

  // execute query
  try {
    const data = await proxy.execute(params)

    await accessor.close()
    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    await accessor.close()
    if (error.code === 121) {
      const errs = error.errInfo?.details?.schemaRulesNotSatisfied
      return res.send({
        code: error.code,
        error: errs,
      })
    }
    return res.send({
      code: error.code || 1,
      error: error
    })
  }
}
