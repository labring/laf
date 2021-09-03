/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2021-09-03 20:30:19
 * @Description: 
 */

import { CloudFunctionStruct } from 'cloud-function-engine'
import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'

const { FUNCTION_READ } = permissions


/**
 * Get functions
 */
export async function handleGetFunctions(req: Request, res: Response) {
  const db = DatabaseAgent.sys_db
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // build query object
  const { keyword, tag, status } = req.body
  const limit = req.body?.limit ?? 10
  const page = req.body?.page ?? 1

  const query = {
    appid: app.appid
  }
  if (keyword) {
    query['$or'] = [
      { name: db.RegExp({ regexp: `.*${keyword}.*` }) },
      { label: db.RegExp({ regexp: `.*${keyword}.*` }) },
      { description: db.RegExp({ regexp: `.*${keyword}.*` }) }
    ]
  }

  if (tag) {
    query['tags'] = tag
  }

  if (status) {
    query['status'] = status
  }

  const coll = db.collection(Constants.cn.functions)

  // do db query
  const ret = await coll
    .where(query)
    .limit(limit)
    .skip((page - 1) * limit)
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


/**
 * Get a function by id
 */
export async function handleGetFunctionById(req: Request, res: Response) {
  const db = DatabaseAgent.sys_db
  const app: ApplicationStruct = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const coll = db.collection(Constants.cn.functions)

  // do db query
  const ret = await coll
    .where({ _id: func_id })
    .getOne<CloudFunctionStruct>()

  return res.send({
    data: ret.data
  })
}