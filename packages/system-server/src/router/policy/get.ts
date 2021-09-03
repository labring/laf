/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 23:09:23
 * @LastEditTime: 2021-09-03 23:19:58
 * @Description: 
 */


import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'

const { POLICY_READ } = permissions


/**
 * Get policies
 */
export async function handleGetPolicies(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_db
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, POLICY_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // build query object
  const { keyword } = req.body
  const limit = req.body?.limit ?? 10
  const page = req.body?.page ?? 1

  const query = {
    appid: app.appid
  }
  if (keyword) {
    query['$or'] = [
      { name: db.RegExp({ regexp: `.*${keyword}.*` }) },
      { description: db.RegExp({ regexp: `.*${keyword}.*` }) }
    ]
  }

  const coll = db.collection(Constants.cn.policies)

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
 * Get a policy by id
 */
export async function handleGetPolicyById(req: Request, res: Response) {
  const db = DatabaseAgent.sys_db
  const app: ApplicationStruct = req['parsed-app']
  const policy_id = req.params.policy_id

  // check permission
  const code = await checkPermission(req['auth']?.uid, POLICY_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // do db query
  const ret = await db.collection(Constants.cn.policies)
    .where({ _id: policy_id })
    .getOne()

  return res.send({
    data: ret.data
  })
}