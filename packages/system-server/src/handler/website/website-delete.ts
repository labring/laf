import { DatabaseAgent } from '../../db'
import { Request, Response } from "express"
import { CN_WEBSITE_HOSTING } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ObjectId } from 'mongodb'
import { WebsiteActionDef } from '../../actions'
import {deleteWebsiteRoute} from "../../support/route";

/**
 * handle delete website
 * @param req request
 * @param res response
 * @returns data
 */
export async function handleDeleteWebsite(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const code = await checkPermission(uid, WebsiteActionDef.DeleteWebsite, app)
  if (code) {
    return res.status(code).send()
  }

  // check id
  const id = req.params.id
  const existed = await db
    .collection(CN_WEBSITE_HOSTING)
    .countDocuments({ _id: new ObjectId(id), appid: app.appid })
  if (!existed) {
    return res.status(422).send("invalid id")
  }

  // delete
  const r = await db.collection(CN_WEBSITE_HOSTING).updateOne(
    { _id: new ObjectId(id), appid: app.appid },
    { $set: { status: "deleted", state: "pending", updated_at: new Date() } }
  )
  const rt = await deleteWebsiteRoute(app.appid, id)
  if (!rt) {
    return res.send({ code: 'ROUTE DELETE FAILED', error: "route delete failed" })
  }
  return res.send({ data: r.modifiedCount })
}