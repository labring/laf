import { DatabaseAgent } from "./../../../../app-service/src/db"
import { Request, Response } from "express"
import { CN_APPLICATIONS, CONST_DICTS } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"

/**
 * handle delete replicate auth
 */
export async function handleDeleteReplicateAuth(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const uid = res["auth"]?.uid

  // check login
  if (!uid) {
    res.status(401).send()
  }

  const app: IApplicationData = req["parsed-app"]
  // check permission
  const { REPLICATE_AUTH_REMOVE } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_AUTH_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check id
  const id = req.params.id
  const existed = await db
    .collection<IApplicationData>(CN_APPLICATIONS)
    .countDocuments({ _id: id })
  if (!existed) {
    return res.status(422).send("invalid id")
  }

  //remove
  const r = db.collection(CN_APPLICATIONS).deleteOne({ _id: id })
  return res.send({ data: (await r).deletedCount })
}
