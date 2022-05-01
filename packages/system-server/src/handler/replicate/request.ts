import { Request, Response } from "express"
import { DatabaseAgent } from "../../db"
import { CN_APPLICATIONS, CN_FUNCTIONS, CN_POLICIES, CN_REPLICATE_AUTH, CN_REPLICATE_REQUESTS, CONST_DICTS } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ObjectId } from "mongodb"
import { deployFunctions, publishFunctions } from "../../support/function"
import { deployPolicies, publishAccessPolicies } from "../../support/policy"

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
  const { REPLICATE_REQUEST_READ } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_REQUEST_READ.name, app)
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
  const { REPLICATE_REQUEST_ADD } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_REQUEST_ADD.name, app)
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

/**
 * handle apply replicate Request
 * @param req request
 * @param res response
 * @returns data
 */
export async function handleApplyReplicateRequest(req: Request, res: Response) {
  const uid = req["auth"]?.uid
  const id = req.params.id
  const app: IApplicationData = req["parsed-app"]

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const { REPLICATE_REQUEST_UPDATE } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_REQUEST_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check request
  const db = DatabaseAgent.db
  const request = await db.collection(CN_REPLICATE_REQUESTS)
    .findOne({ _id: new ObjectId(id), target_appid: app.appid })

  if (!request)
    return res.status(422).send('invalid request')

  if ('pending' !== request.status) {
    return res.status(422).send('invalid request')
  }

  // deploy
  if (request.functions?.items?.length) {
    await deployFunctions(app.appid, request.functions.items)
    await publishFunctions(app)
  }
  if (request.policies?.items?.length) {
    await deployPolicies(app.appid, request.policies.items)
    await publishAccessPolicies(app)
  }

  // update status
  await db.collection(CN_REPLICATE_REQUESTS)
    .updateOne({
      _id: new ObjectId(id),
      target_appid: app.appid
    }, {
      $set: {
        status: 'accepted',
        updated_at: new Date(),
        updated_by: new ObjectId(uid)
      }
    })

  return res.send({ data: 'accepted' })
}