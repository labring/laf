/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-06 15:47:57
 * @LastEditTime: 2021-09-10 00:06:46
 * @Description: 
 */

import { Request, Response } from 'express'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { ApplicationStruct } from '../../api/application'
import { DatabaseAgent } from '../../lib/db-agent'
import * as assert from 'assert'
import { deployFunctions, publishFunctions } from '../../api/function'
import { deployPolicies, publishAccessPolicy } from '../../api/policy'


const { DEPLOY_REQUEST_REMOVE, DEPLOY_REQUEST_READ, DEPLOY_REQUEST_APPLY } = Constants.permissions

/**
 * Get deploy requests
 */
export async function handleGetDeployRequests(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const db = DatabaseAgent.sys_db

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
      { source: db.RegExp({ regexp: `.*${keyword}.*` }) },
      { comment: db.RegExp({ regexp: `.*${keyword}.*` }) }
    ]
  }

  const coll = db.collection(Constants.cn.deploy_requests)

  // do db query
  const r = await coll
    .where(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .orderBy('created_at', 'desc')
    .get()

  // get the count
  const { total } = await coll
    .where(query)
    .count()

  if (r.error) {
    return res.status(400).send({ error: r.error })
  }

  return res.send({
    data: r.data,
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
  const app: ApplicationStruct = req['parsed-app']
  const db = DatabaseAgent.sys_db
  const req_id = req.params.req_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_REQUEST_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(Constants.cn.deploy_requests)
    .where({ appid: app.appid, _id: req_id })
    .remove()

  return res.send({ data: r })
}

/**
 * Apply the deployment requests which accept from remote environment
 */
export async function handleApplyDeployRequest(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const req_id = req.params.req_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_REQUEST_APPLY.name, app)
  if (code) {
    return res.status(code).send()
  }


  const db = DatabaseAgent.sys_db
  const { data: deploy_request } = await db.collection(Constants.cn.deploy_requests)
    .where({ _id: req_id, appid: app.appid })
    .getOne()

  if (!deploy_request)
    return res.status(404).send('deploy request not found')

  if (deploy_request.status !== 'pending') {
    return res.status(422).send('the status of deploy request should be `pending`')
  }

  const type = deploy_request.type
  assert.ok(['function', 'policy'].includes(type))

  // deploy functions
  if (type === 'function') {
    await deployFunctions(deploy_request.data)
    await publishFunctions(app)
  }

  // deploy policies
  if (type === 'policy') {
    await deployPolicies(deploy_request.data)
    await publishAccessPolicy(app)
  }

  // update deploy request status to 'deployed'
  await db.collection(Constants.cn.deploy_requests)
    .where({ _id: req_id, appid: app.appid })
    .update({ status: 'deployed' })

  return res.send({
    code: 0,
    data: 'deployed'
  })
}