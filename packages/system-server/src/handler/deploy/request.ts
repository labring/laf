/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-06 15:47:57
 * @LastEditTime: 2021-10-08 01:36:02
 * @Description: 
 */

import { Request, Response } from 'express'
import { checkPermission } from '../../support/permission'
import { CN_DEPLOY_REQUESTS, CONST_DICTS } from '../../constants'
import { IApplicationData } from '../../support/application'
import { DatabaseAgent } from '../../db'
import * as assert from 'assert'
import { deployFunctions, publishFunctions } from '../../support/function'
import { deployPolicies, publishAccessPolicies } from '../../support/policy'
import { ObjectId } from 'mongodb'


const { DEPLOY_REQUEST_REMOVE, DEPLOY_REQUEST_READ, DEPLOY_REQUEST_APPLY } = CONST_DICTS.permissions

/**
 * Get deploy requests
 */
export async function handleGetDeployRequests(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']
  const db = DatabaseAgent.db

  // check permission
  const code = await checkPermission(uid, DEPLOY_REQUEST_READ.name, app)
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
      { source: { $regex: `${keyword}`, $options: '' } },
      { comment: { $regex: `${keyword}`, $options: '' } }
    ]
  }

  const coll = db.collection(CN_DEPLOY_REQUESTS)

  // do db query
  const docs = await coll
    .find(query, {
      limit,
      skip: (page - 1) * limit,
      sort: { created_at: -1 }
    })
    .toArray()

  // get the count
  const total = await coll
    .countDocuments(query)

  return res.send({
    data: docs,
    total: total,
    limit: limit,
    page
  })
}

/**
 * Remove a deploy request
 */
export async function handleRemoveDeployRequest(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']
  const db = DatabaseAgent.db
  const req_id = req.params.req_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_REQUEST_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(CN_DEPLOY_REQUESTS)
    .deleteOne({ appid: app.appid, _id: new ObjectId(req_id) })

  return res.send({ data: r })
}

/**
 * Apply the deployment requests which accept from remote environment
 */
export async function handleApplyDeployRequest(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']
  const req_id = req.params.req_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_REQUEST_APPLY.name, app)
  if (code) {
    return res.status(code).send()
  }

  const db = DatabaseAgent.db
  const deploy_request = await db.collection(CN_DEPLOY_REQUESTS)
    .findOne({ _id: new ObjectId(req_id), appid: app.appid })

  if (!deploy_request)
    return res.status(404).send('deploy request not found')

  if (deploy_request.status !== 'pending') {
    return res.status(422).send('the status of deploy request should be `pending`')
  }

  const type = deploy_request.type
  assert.ok(['function', 'policy'].includes(type))

  // deploy functions
  if (type === 'function') {
    await deployFunctions(app.appid, deploy_request.data)
    await publishFunctions(app)
  }

  // deploy policies
  if (type === 'policy') {
    await deployPolicies(app.appid, deploy_request.data)
    await publishAccessPolicies(app)
  }

  // update deploy request status to 'deployed'
  await db.collection(CN_DEPLOY_REQUESTS)
    .updateOne({
      _id: new ObjectId(req_id),
      appid: app.appid
    }, {
      $set: { status: 'deployed' }
    })

  return res.send({
    code: 0,
    data: 'deployed'
  })
}