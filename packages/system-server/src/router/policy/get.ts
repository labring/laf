/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 23:09:23
 * @LastEditTime: 2021-10-08 01:47:59
 * @Description: 
 */


import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { PolicyStruct } from '../../api/policy'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'

const { POLICY_READ } = permissions


/**
 * Get policies
 */
export async function handleGetPolicies(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, POLICY_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // build query object
  const { keyword } = req.query
  const limit = Number(req.query?.limit || 10)
  const page = Number(req.query?.page || 1)

  const query = {
    appid: app.appid
  }
  if (keyword) {
    query['$or'] = [
      { name: { $regex: `${keyword}`, $options: '' } },
      { description: { $regex: `${keyword}`, $options: '' } }
    ]
  }

  const coll = db.collection(Constants.cn.policies)

  // do db query
  const docs = await coll
    .find(query, {
      limit,
      skip: (page - 1) * limit
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
 * Get a policy by id
 */
export async function handleGetPolicyById(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: ApplicationStruct = req['parsed-app']
  const policy_id = req.params.policy_id

  // check permission
  const code = await checkPermission(req['auth']?.uid, POLICY_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  // do db query
  const doc = await db.collection<PolicyStruct>(Constants.cn.policies)
    .findOne({ _id: new ObjectId(policy_id) })

  return res.send({
    data: doc
  })
}