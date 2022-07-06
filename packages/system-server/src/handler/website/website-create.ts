import { CN_WEBSITE_HOSTING } from "../../constants"
import { Request, Response } from "express"
import { DatabaseAgent } from "../../db"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { URL } from "node:url"
import Config from "../../config"
import { WebsiteActionDef } from "../../actions"
import {createWebsiteRoute} from "../../support/route";

/**
 * handle create website hosting
 * @param req request
 * @param res response
 * @returns data
 */
export async function handleCreateWebsite(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid
  const { label, bucket } = req.body

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const code = await checkPermission(uid, WebsiteActionDef.CreateWebsite, app)
  if (code) {
    return res.status(code).send()
  }

  // check params
  if (!label) {
    return res.status(422).send("no label")
  }
  if (!bucket) {
    return res.status(422).send("no bucket")
  }

  const existed = await db.collection(CN_WEBSITE_HOSTING)
    .countDocuments({ appid: app.appid, bucket_name: bucket, status: { $ne: "deleted" } })
  if (existed) {
    return res.send({ code: 1, error: "the bucket has been used" })
  }

  // generate cname url for bucket and appid
  const endpoint = new URL(Config.MINIO_CONFIG.endpoint.external)
  const { hostname } = endpoint
  const cname = `${app.appid}-${bucket}.${hostname}`

  // build website hosting data
  const doc = {
    label,
    bucket_name: bucket,
    appid: app.appid,
    domain: [] as string[],
    cname,
    status: 'enabled', // 'enabled' | 'disabled' | 'deleted' , the logic status of website
    state: 'pending', // 'created' | 'deleted' | 'pending', the real state of website
    created_at: new Date(),
    updated_at: new Date()
  }

  // create website hosting
  const result = await db.collection(CN_WEBSITE_HOSTING)
    .insertOne(doc)
  if (!result.insertedId) {
    return res.status(500).send("insert failed")
  }

  const domainList = [cname]
  const rt = await createWebsiteRoute('website-custom', app.appid, result.insertedId.toString(), domainList, uid)
  if (!rt) {
    return res.send({ code: 'ROUTE CREATE FAILED', error: "route create failed" })
  }

  // return data
  res.send({
    data: { id: result.insertedId }
  })
}