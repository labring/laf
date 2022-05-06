import { Request, Response } from "express"
import { DatabaseAgent } from "../../db"
import { CN_REPLICATE_REQUESTS, CONST_DICTS } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ObjectId } from "mongodb"

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
  const { REPLICATE_REQUEST_REMOVE } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_REQUEST_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // remove 
  const r = await db.collection(CN_REPLICATE_REQUESTS).deleteOne({ _id: new ObjectId(id) })
  return res.send({ data: r.deletedCount })
}
