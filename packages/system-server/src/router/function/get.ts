/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2021-11-01 16:56:16
 * @Description: 
 */

import { CloudFunctionStruct } from 'cloud-function-engine'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ApplicationStruct } from '../../api/application'
import { FunctionStruct, getFunctionById } from '../../api/function'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'

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

  const coll = db.collection<CloudFunctionStruct>(Constants.cn.functions)

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
  const docs = await db.collection<FunctionStruct>(Constants.cn.functions)
    .distinct('tags', { appid: app.appid })

  return res.send({
    data: docs
  })
}
