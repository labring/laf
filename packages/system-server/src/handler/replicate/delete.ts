import { DatabaseAgent } from '../../db'
import { Request, Response } from "express"
import { CN_REPLICATE_AUTH, CONST_DICTS } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ObjectId } from 'mongodb'

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
  const { REPLICATE_AUTH_REMOVE } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_AUTH_REMOVE.name, app)
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
