import { Request, Response } from "express"
import { DatabaseAgent } from "../../db"
import { CN_REPLICATE_REQUESTS } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ObjectId } from "mongodb"
import { ReplicationActionDef } from "../../actions"

/**
 * handle delete replicate Request
 * @param req request
 * @param res response
 * @returns data
 */
export async function handleDeleteReplicateRequest(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid
  const id = req.params.id

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const code = await checkPermission(uid, ReplicationActionDef.DeleteReplicateRequest, app)
  if (code) {
    return res.status(code).send()
  }

  // remove 
  const r = await db.collection(CN_REPLICATE_REQUESTS).deleteOne({ _id: new ObjectId(id) })
  return res.send({ data: r.deletedCount })
}
