import { Request, Response } from "express"
import { DatabaseAgent } from "../../db"
import { CN_REPLICATE_REQUESTS } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ReplicationActionDef } from "../../actions"

/**
 * handle get replicate request
 * @param req request
 * @param res response
 * @returns page list
 */
export async function handleGetReplicateRequest(req: Request, res: Response) {
  const uid = req["auth"]?.uid
  // check login
  if (!uid) {
    res.status(401).send()
  }

  const app: IApplicationData = req["parsed-app"]

  // check permission
  const code = await checkPermission(uid, ReplicationActionDef.ListReplicateRequest, app)
  if (code) {
    return res.status(code).send()
  }

  // build query object
  const limit = Number(req.query?.limit || 10)
  const page = Number(req.query?.page || 1)

  // builder query 
  const params = { target_appid: app.appid }

  // page query
  const db = DatabaseAgent.db
  const docs = await db.collection<IApplicationData>(CN_REPLICATE_REQUESTS).find(params,
    {
      limit,
      skip: (page - 1) * limit,
      sort: { created_at: -1 }
    }
  ).toArray()

  // page total
  const total = await db.collection<IApplicationData>(CN_REPLICATE_REQUESTS).countDocuments(params)

  return res.send({
    data: docs,
    total: total,
    limit: limit,
    page
  })

}
