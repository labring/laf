import { CN_WEBSITE_HOSTING } from "../../constants"
import { Request, Response } from "express"
import { CONST_DICTS } from "../../constants"
import { DatabaseAgent } from "../../db"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"

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
  const { WEBSITE_HOSTING_ADD } = CONST_DICTS.permissions
  const code = await checkPermission(uid, WEBSITE_HOSTING_ADD.name, app)
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
    .countDocuments({ appid: app.appid, bucket })
  if (existed) {
    return res.status(422).send("bucket already exists")
  }

  // generate cname url for bucket and appid
  const cname = `${app.appid}-${bucket}.oss.lafyun.com`

  // build website hosting data
  const doc = {
    label,
    bucket_name: bucket,
    appid: app.appid,
    domain: null,
    cname,
    status: 'enabled', // 'enabled' | 'disabled' | 'deleted' | 'modified'  资源的逻辑状态
    state: 'created', // 'created' | 'deleted' | 'pending',  // 资源的物理状态
    created_at: new Date(),
    updated_at: new Date()
  }

  // insert website hosting
  const result = await db.collection(CN_WEBSITE_HOSTING)
    .insertOne(doc)
  if (!result.insertedId) {
    return res.status(500).send("insert failed")
  }

  // return data
  res.send({
    code: 0,
    data: {
      id: result.insertedId
    }
  })
}