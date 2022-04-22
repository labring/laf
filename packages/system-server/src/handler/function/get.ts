/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2022-01-13 13:53:49
 * @Description: 
 */

import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ApplicationStruct, getApplicationDbAccessor } from '../../support/application'
import { CloudFunctionStruct, getFunctionById } from '../../support/function'
import { checkPermission } from '../../support/permission'
import { CN_ACCOUNTS, CN_FUNCTIONS, CN_FUNCTION_HISTORY, CN_PUBLISHED_FUNCTIONS } from '../../constants'
import { permissions } from '../../permissions'
import { DatabaseAgent } from '../../db'

const { FUNCTION_READ } = permissions


/**
 * Get functions
 */
export async function handleGetFunctions(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // build query object
  const { keyword, tag, status } = req.query
  const limit = Number(req.query?.limit || 10)
  const page = Number(req.query?.page || 1)

  const query = { appid: app.appid }
  if (keyword) {
    const regexp = {
      $regex: `${keyword}`,
      $options: ''
    }
    query['$or'] = [
      { name: regexp },
      { label: regexp },
      { description: regexp }
    ]
  }

  if (tag) {
    query['tags'] = tag
  }

  if (status) {
    query['status'] = Number(status)
  }

  const coll = db.collection<CloudFunctionStruct>(CN_FUNCTIONS)

  // do db query
  const docs = await coll
    .find(query, {
      limit,
      skip: (page - 1) * limit,
      projection: { compiledCode: 0 }
    })
    .toArray()

  // get the count
  const total = await coll.countDocuments(query)

  return res.send({
    data: docs,
    total: total,
    limit: limit,
    page
  })
}


/**
 * Get a function by id
 */
export async function handleGetFunctionById(req: Request, res: Response) {
  const app: ApplicationStruct = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const doc = await getFunctionById(app.appid, new ObjectId(func_id))

  return res.send({ data: doc })
}


/**
 * Get all of the function tags
 */
export async function handleGetAllFunctionTags(req: Request, res: Response) {
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const db = DatabaseAgent.db
  const docs = await db.collection<CloudFunctionStruct>(CN_FUNCTIONS)
    .distinct('tags', { appid: app.appid })

  return res.send({
    data: docs
  })
}

/**
 * Get published functions
 */
export async function handleGetPublishedFunctions(req: Request, res: Response) {
  const app: ApplicationStruct = req['parsed-app']

  const func_ids = req.body?.ids
  if (!(func_ids instanceof Array) || !func_ids?.length) {
    return res.status(422).send('invalid param func_ids')
  }

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // build query object
  const ids = func_ids.map(id => new ObjectId(id))
  const query = { appid: app.appid, _id: { $in: ids } }

  const accessor = await getApplicationDbAccessor(app)
  const db = accessor.db
  const docs = await db.collection(CN_PUBLISHED_FUNCTIONS)
    .find(query, {})
    .toArray()

  await accessor.close()
  return res.send({
    data: docs
  })
}


/**
 * Get a function's change history
 */
export async function handleGetFunctionHistory(req: Request, res: Response) {
  const app: ApplicationStruct = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const limit = Number(req.query?.limit || 10)
  const page = Number(req.query?.page || 1)


  // const doc = await getFunctionById(app.appid, new ObjectId(func_id))
  const db = DatabaseAgent.db
  const docs = await db.collection(CN_FUNCTION_HISTORY)
    .aggregate()
    .match({
      appid: app.appid,
      func_id: new ObjectId(func_id),
    })
    .lookup({
      from: CN_ACCOUNTS,
      localField: 'created_by',
      foreignField: '_id',
      as: 'account'
    })
    .project({
      'account.password': 0,
      'account.quota': 0,
      'account.created_at': 0,
      'account.updated_at': 0,
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ created_at: -1 })
    .toArray()

  for (const doc of docs) {
    doc.account = doc.account?.length ? doc.account[0] : null
  }

  return res.send({ data: docs })
}
