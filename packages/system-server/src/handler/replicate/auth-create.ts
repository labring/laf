import { CN_APPLICATIONS, CN_REPLICATE_AUTH } from "../../constants"
import { Request, Response } from "express"
import { DatabaseAgent } from "../../db"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ReplicationActionDef } from "../../actions"

/**
 * handle create replicate auth
 */
export async function handleCreateReplicateAuth(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const uid = req["auth"]?.uid

  // check login
  if (!uid) {
    res.status(401).send()
  }

  const { target_appid } = req.body
  const app: IApplicationData = req["parsed-app"]

  // check params
  if (!target_appid) {
    return res.status(422).send("invalid target_appid")
  }

  // check target_appid
  const existed = await db
    .collection<IApplicationData>(CN_APPLICATIONS)
    .countDocuments({ appid: target_appid })
  if (!existed) {
    return res.status(422).send("invalid target_appid")
  }

  // check permission
  const code = await checkPermission(uid, ReplicationActionDef.CreateReplicateAuth, app)
  if (code) {
    return res.status(code).send()
  }

  // check auth if exists
  const total = await db
    .collection<IApplicationData>(CN_REPLICATE_AUTH)
    .countDocuments({ source_appid: app.appid, target_appid: target_appid })
  if (total > 0) {
    return res.send({ code: 422, message: "already exists" })
  }

  // add auth
  const result = await db.collection(CN_REPLICATE_AUTH).insertOne({
    status: "pending",
    source_appid: app.appid,
    target_appid: target_appid,
    created_at: new Date(),
  })

  return res.send({ data: result.insertedId })
}
