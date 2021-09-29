/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2021-09-29 12:12:36
 * @Description: 
 */

import { CloudFunctionStruct } from 'cloud-function-engine'
import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { FunctionStruct } from '../../api/function'
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
  const { keyword, tag, status } = req.query
  const limit = Number(req.query?.limit || 10)
  const page = Number(req.query?.page || 1)

  const query = {
    appid: app.appid
  }
  if (keyword) {
    query['$or'] = [
      { name: db.RegExp({ regexp: `.*${keyword}.*`, options: 'i' }) },
      { label: db.RegExp({ regexp: `.*${keyword}.*`, options: 'i' }) },
      { description: db.RegExp({ regexp: `.*${keyword}.*`, options: 'i' }) }
    ]
  }

  if (tag) {
    query['tags'] = tag
  }

  if (status) {
    query['status'] = Number(status)
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
    .where({ _id: func_id, appid: app.appid })
    .getOne<CloudFunctionStruct>()

  return res.send({
    data: ret.data
  })
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

  const db = DatabaseAgent.sys_accessor.db

  const docs = await db.collection<FunctionStruct>(Constants.cn.functions)
    .distinct('tags', {
      appid: app.appid

    })

  return res.send({
    data: docs
  })
}
