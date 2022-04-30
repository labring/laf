import { DatabaseAgent } from '../../db'
import { Request, Response } from "express"
import { CONST_DICTS } from "../../constants"
import { IApplicationData, getApplicationByAppid } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { publishFunctions, publishOneFunction } from '../../support/function'
import { publishAccessPolicies } from '../../support/policy'

/**
 * handle put replicates
 */
export async function handleUpdateReplicas(req: Request, res: Response) {
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid
  const body = req.body

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const { REPLICATES_PUT } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATES_PUT.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check params
  const target_appid = body?.target_appid
  if (!target_appid) {
    res.status(422).send("invalid target_appid")
  }
  const types = ["all", "type"]
  const functions = body?.functions
  const fun_type = body?.functions?.type
  if (functions && !types.includes(fun_type)) {
    res.status(422).send(" invalid functions of type")
  }
  const policies = body?.policies
  const pol_type = body?.policies?.type
  if (policies && !types.includes(pol_type)) {
    res.status(422).send(" invalid policies of type")
  }

  // check target app 
  const target_app = await getApplicationByAppid(target_appid)
  if (!target_app) {
    return res.status(422).send("invalid target_appid")
  }

  // push replicates
  const accessor = DatabaseAgent.sys_accessor
  const session = accessor.conn.startSession()
  try {
    await session.withTransaction(async () => {
      if (functions && 'all' === fun_type) {
        await publishFunctions(target_app)
      }
      if (functions && 'all' == pol_type) {
        await publishAccessPolicies(target_app)
      }
      if (functions && 'part' === fun_type) {
        for (const fuc of functions.items) {
          await publishOneFunction(target_app, fuc.id)
        }
      }
      if (policies && 'part' === pol_type) {
        for (const pol of policies.items) {
          await publishOneFunction(target_app, pol.id)
        }
      }
    })
  } finally {
    await session.endSession()
  }
  return res.send("pushed")
}

