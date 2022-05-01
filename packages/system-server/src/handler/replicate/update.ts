import { ObjectId } from "mongodb"
import { CN_REPLICATE_AUTH } from "../../constants"
import { Request, Response } from "express"
import { CONST_DICTS } from "../../constants"
import { checkPermission } from "../../support/permission"
import { IApplicationData } from "../../support/application"
import { DatabaseAgent } from "../../db"

/**
 *  handle update replicate auth
 */
export async function handleUpdateReplicateAuth(req: Request, res: Response) {
  const uid = req["auth"]?.uid
  if (!uid) res.status(401).send()

  const id = req.params.id
  const { status } = req.body
  const app: IApplicationData = req["parsed-app"]
  const db = DatabaseAgent.db

  // check params
  if (!["accept", "reject"].includes(status)) {
    return res.status(422).send("invalid status")
  }

  // check permission
  const { REPLICATE_AUTH_UPDATE } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_AUTH_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }
  
  const exited = await db
    .collection(CN_REPLICATE_AUTH)
    .countDocuments({ _id: new ObjectId(id), target_appid: app.appid })
  if (!exited) return res.send({ code: 1, message: "no permission" })

  // update auth
  if (status === "accept") {
    const r = await db.collection(CN_REPLICATE_AUTH).updateOne(
      {
        _id: new ObjectId(id),
        target_appid: app.appid,
        status: "pending",
      },
      {
        $set: { status, updated_at: new Date() },
      }
    )
    return res.send({ code: 0, data: r.modifiedCount })
  }

  // reject and remove
  const r = await db
    .collection(CN_REPLICATE_AUTH)
    .deleteOne({ _id: new ObjectId(id), status: "pending" })
  return res.send({ code: 0, data: r.deletedCount })
}
