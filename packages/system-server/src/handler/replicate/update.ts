import { ObjectId } from "mongodb"
import { CN_REPLICATE_AUTH } from "../../constants"
import { DatabaseAgent } from "../../../../app-service/src/db"
import { Request, Response } from "express"
import { CONST_DICTS } from "../../constants"
import { checkPermission } from "../../support/permission"
import { IApplicationData } from "../../support/application"

/**
 *  handle update replicate auth
 */
export async function handleUpdateReplicateAuth(req: Request, res: Response) {
  const uid = req["auth"]?.uid
  if (!uid) res.status(401).send()
  const id = req.params.id
  const { status } = req.body
  const app: IApplicationData = req["parsed-app"]

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

  // update auth
  const db = DatabaseAgent.db
  if (status === "accept") {
    const r = await db.collection(CN_REPLICATE_AUTH).updateOne(
      {
        _id: new ObjectId(id),
        status: "pending",
      },
      {
        $set: { status, updated_at: new Date() },
      }
    )
    return res.send({ data: r.modifiedCount })
  }

  // reject and remove
  const r = await db
    .collection(CN_REPLICATE_AUTH)
    .deleteOne({ _id: new ObjectId(id), status: "pending" })
  return res.send({ data: r.deletedCount })
}
