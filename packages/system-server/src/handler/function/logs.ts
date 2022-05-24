/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2022-01-13 13:54:13
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData, getApplicationDbAccessor } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { FunctionActionDef } from '../../actions'
import { ObjectId } from 'mongodb'


/**
 * Get function logs
 */
export async function handleGetFunctionLogs(req: Request, res: Response) {
  const app: IApplicationData = req['parsed-app']
  const accessor = await getApplicationDbAccessor(app)
  const db = accessor.db

  // check permission
  const code = await checkPermission(req['auth']?.uid, FunctionActionDef.ListLogs, app)
  if (code) {
    return res.status(code).send()
  }

  // build query object
  const { requestId, func_id, trigger_id } = req.query
  const limit = Number(req.query?.limit || 10)
  const page = Number(req.query?.page || 1)

  const query = {}

  if (requestId) {
    query['requestId'] = requestId
  }

  if (func_id) {
    query['func_id'] = new ObjectId(func_id as string)
  }

  if (trigger_id) {
    query['trigger_id'] = trigger_id
  }

  const coll = db.collection('__function_logs')

  // do db query
  const docs = await coll
    .find(query, { limit, skip: (page - 1) * limit, sort: { created_at: -1 } })
    .toArray()

  // get the count
  const total = await coll
    .countDocuments(query)

  await accessor.close()

  return res.send({
    data: docs,
    total: total,
    limit: limit,
    page
  })
}