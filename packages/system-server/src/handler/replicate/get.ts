import { Request, Response } from "express"
import { CN_REPLICATE_AUTH, CONST_DICTS } from "../../constants"
import { DatabaseAgent } from "../../db"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"

/**
 * handle get replicate auth
 */
export async function handleGetReplicateAuth(req: Request, res: Response) {
  const uid = req["auth"]?.uid
  // check login
  if (!uid) {
    res.status(401).send()
  }

  const app: IApplicationData = req["parsed-app"]

  // check permission
  const { REPLICATE_AUTH_READ } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_AUTH_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // find list
  const query = {}
  const db = DatabaseAgent.db
  query["$or"] = [{ source_appid: app.appid }, { target_appid: app.appid }]
  const docs = await db.collection(CN_REPLICATE_AUTH).find(query).toArray()

  return res.send({ data: docs })
}
