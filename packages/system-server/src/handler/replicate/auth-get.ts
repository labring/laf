import { Request, Response } from "express"
import { ReplicationActionDef } from "../../actions"
import { CN_REPLICATE_AUTH } from "../../constants"
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
  const code = await checkPermission(uid, ReplicationActionDef.ListReplicateAuth, app)
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
