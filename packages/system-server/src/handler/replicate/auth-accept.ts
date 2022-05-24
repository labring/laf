import { ObjectId } from "mongodb"
import { CN_REPLICATE_AUTH } from "../../constants"
import { Request, Response } from "express"
import { checkPermission } from "../../support/permission"
import { IApplicationData } from "../../support/application"
import { DatabaseAgent } from "../../db"
import { ReplicationActionDef } from "../../actions"

/**
 *  handle accept replicate auth
 */
export async function handleAcceptReplicateAuth(req: Request, res: Response) {
  const uid = req["auth"]?.uid
  if (!uid) res.status(401).send()

  const id = req.params.id
  const app: IApplicationData = req["parsed-app"]
  const db = DatabaseAgent.db

  // check permission
  const code = await checkPermission(uid, ReplicationActionDef.UpdateReplicateAuth, app)
  if (code) {
    return res.status(code).send()
  }

  // check auth
  const exited = await db
    .collection(CN_REPLICATE_AUTH)
    .countDocuments({ _id: new ObjectId(id), target_appid: app.appid })
  if (!exited) return res.send({ code: 1, message: "no permission" })

  // update auth
  const r = await db.collection(CN_REPLICATE_AUTH).updateOne(
    {
      _id: new ObjectId(id),
      target_appid: app.appid,
      status: "pending",
    },
    {
      $set: { status: 'accepted', updated_at: new Date() },
    }
  )
  return res.send({ data: r.modifiedCount })
}
