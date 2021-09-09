/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2021-09-10 01:14:32
 * @Description: 
 */

import { Request, Response } from 'express'
import { getDb } from 'less-api'
import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { permissions } from '../../constants/permissions'

const { FUNCTION_READ } = permissions


/**
 * Get function logs
 */
export async function handleGetFunctionLogs(req: Request, res: Response) {
  const app: ApplicationStruct = req['parsed-app']
  const accessor = await getApplicationDbAccessor(app)
  const db = getDb(accessor)

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // build query object
  const { requestId, func_id, trigger_id } = req.query
  const limit = req.body?.limit ?? 10
  const page = req.body?.page ?? 1

  const query = {}

  if (requestId) {
    query['requestId'] = requestId
  }

  if (func_id) {
    query['func_id'] = func_id
  }

  if (trigger_id) {
    query['trigger_id'] = trigger_id
  }

  const coll = db.collection('__function_logs')

  // do db query
  const ret = await coll
    .where(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .orderBy('created_at', 'desc')
    .get()

  // get the count
  const { total } = await coll
    .where(query)
    .count()

  return res.send({
    data: ret.data,
    total: total,
    limit: limit,
    page
  })
}