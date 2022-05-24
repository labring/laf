/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2022-01-13 13:52:09
 * @Description: 
 */

import { Proxy, Policy, ActionType } from 'database-proxy'
import { IApplicationData, getApplicationDbAccessor } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { DatabaseActionDef } from '../../actions'
import { Request, Response } from 'express'


/**
 * The db proxy entry for database management
 */
export async function handleDbProxy(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  const accessor = await getApplicationDbAccessor(app)

  // don't need policy rules, open all collections' access permission for dbm use
  const proxy = new Proxy(accessor, new Policy(accessor))

  // parse params
  const params = proxy.parseParams(req.body)

  // check permission
  const code = await checkDatabaseActionPermission(params.action, uid, app)
  if (code) {
    return res.status(code).send()
  }

  params.action

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



async function checkDatabaseActionPermission(dbAction: ActionType, uid: string, app: IApplicationData) {
  let action = ''
  switch (dbAction) {
    case ActionType.ADD:
      action = DatabaseActionDef.CreateDocument
      break
    case ActionType.UPDATE:
      action = DatabaseActionDef.UpdateDocument
      break
    case ActionType.REMOVE:
      action = DatabaseActionDef.DeleteDocument
      break
    case ActionType.READ:
      action = DatabaseActionDef.ListDocuments
      break
    case ActionType.COUNT:
      action = DatabaseActionDef.ListDocuments
      break
    case ActionType.AGGREGATE:
      action = DatabaseActionDef.ListDocuments
      break
    case ActionType.WATCH:
      action = DatabaseActionDef.ListDocuments
      break
    default:
      action = DatabaseActionDef.DeleteDocument
  }

  const code = await checkPermission(uid, action, app)
  return code
}