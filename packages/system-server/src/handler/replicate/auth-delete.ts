import { DatabaseAgent } from '../../db'
import { Request, Response } from "express"
import { CN_REPLICATE_AUTH } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ObjectId } from 'mongodb'
import { ReplicationActionDef } from '../../actions'

/**
 * handle delete replicate auth
 */
export async function handleDeleteReplicateAuth(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const code = await checkPermission(uid, ReplicationActionDef.DeleteReplicateAuth, app)
  if (code) {
    return res.status(code).send()
  }

  // check id
  const id = req.params.id
  const existed = await db
    .collection<IApplicationData>(CN_REPLICATE_AUTH)
    .countDocuments({ _id: new ObjectId(id) })
  if (!existed) {
    return res.status(422).send("invalid id")
  }

  // remove 
  const r = await db.collection(CN_REPLICATE_AUTH).deleteOne({ _id: new ObjectId(id) })
  return res.send({ data: r.deletedCount })
}
