import { Request, Response } from "express"
import { DatabaseAgent } from "../../db"
import { CN_APPLICATIONS, CN_FUNCTIONS, CN_POLICIES, CN_REPLICATE_AUTH, CN_REPLICATE_REQUESTS } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ObjectId } from "mongodb"
import { ReplicationActionDef } from "../../actions"

/**
 * handle create replicate Request
 * @param req request
 * @param res response
 * @returns data
 */
export async function handleCreateReplicateRequest(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid
  const { target_appid, functions, policies } = req.body

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const code = await checkPermission(uid, ReplicationActionDef.CreateReplicateRequest, app)
  if (code) {
    return res.status(code).send()
  }

  // check params
  if (!target_appid) {
    return res.status(422).send("no target_appid")
  }
  const existed = await db.collection(CN_APPLICATIONS)
    .countDocuments({ appid: target_appid })
  if (!existed) {
    return res.status(422).send("invalid target_appid")
  }

  const authorized = await db.collection(CN_REPLICATE_AUTH)
    .countDocuments({ target_appid: target_appid, source_appid: app.appid, status: 'accepted' })
  if (!authorized) {
    return res.status(403).send()
  }

  // build replicate request data
  const doc = { functions: null, policies: null, target_appid, source_appid: app.appid, status: 'pending', created_by: new ObjectId(uid), created_at: new Date() }
  if ('all' === functions?.type) {
    const items = await db.collection(CN_FUNCTIONS)
      .find({ appid: app.appid })
      .toArray()
    doc.functions = {
      type: functions.type,
      items
    }
  }
  if ('part' === functions?.type && functions?.items?.length > 0) {
    const items = await db.collection(CN_FUNCTIONS)
      .find({
        _id: { $in: functions.items.map(item => new ObjectId(item.id)) },
        appid: app.appid
      })
      .toArray()
    doc.functions = {
      type: functions.type,
      items
    }
  }


  if ('all' === policies?.type) {
    const items = await db.collection(CN_POLICIES)
      .find({ appid: app.appid })
      .toArray()
    doc.policies = {
      type: policies.type,
      items
    }
  }
  if ('part' === policies?.type && policies?.items?.length > 0) {
    const items = await db.collection(CN_POLICIES)
      .find({
        _id: { $in: policies.items.map(item => new ObjectId(item.id)) },
        appid: app.appid
      })
      .toArray()
    doc.policies = {
      type: policies.type,
      items
    }
  }

  // check doc
  if (!doc.functions && !doc.policies) {
    return res.status(422).send("no functions or policies")
  }

  // insert doc
  const r = await db.collection(CN_REPLICATE_REQUESTS).insertOne(doc)

  return res.send({ data: r.insertedId })
}
