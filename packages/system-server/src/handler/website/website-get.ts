import { Request, Response } from "express"
import { WebsiteActionDef } from "../../actions"
import { CN_WEBSITE_HOSTING } from "../../constants"
import { DatabaseAgent } from "../../db"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"

/**
 * handle get websites
 * @param req request
 * @param res response
 * @returns data
 */
export async function handleGetWebsites(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const code = await checkPermission(uid, WebsiteActionDef.ListWebsites, app)
  if (code) {
    return res.status(code).send()
  }

  // get list
  const query = { appid: app.appid, status: { $ne: "deleted" } }
  const docs = await db.collection(CN_WEBSITE_HOSTING).find(query).toArray()

  return res.send({ data: docs })
}