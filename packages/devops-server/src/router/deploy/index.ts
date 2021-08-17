/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-07 01:14:33
 * @LastEditTime: 2021-08-17 17:17:32
 * @Description: 
 */

import * as express from 'express'
import * as assert from 'assert'
import { deployFunctions, publishFunctions } from '../../api/function'
import { checkPermission } from '../../api/permission'
import { DatabaseAgent } from '../../lib/db-agent'
import { getToken, parseToken } from '../../lib/utils/token'
import { deployPolicies, publishAccessPolicy } from '../../api/policy'
import { deployTriggers, publishTriggers } from '../../api/trigger'
import { Constants } from '../../constants'
import { logger } from '../../lib/logger'

export const DeployRouter = express.Router()

/**
 * Create a deployment token
 */
DeployRouter.post('/create-token', async (req, res) => {
  const { permissions, expire, source } = req.body
  if (!permissions || !permissions?.length) {
    return res.send({
      code: 1,
      error: 'invalid permissions'
    })
  }

  if (!expire) {
    return res.send({
      code: 1,
      error: 'invalid expire'
    })
  }

  if (!source) {
    return res.send({
      code: 1,
      error: 'invalid expire'
    })
  }

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'deploy.create_token')
  if (code) {
    return res.status(code).send()
  }

  try {
    const expired_at = Math.floor(Date.now() / 1000 + expire * 3600)
    const payload = { type: "deploy", pns: permissions, exp: expired_at, src: source }
    const token = getToken(payload)

    return res.send({
      code: 0,
      data: {
        source,
        token,
        expired_at,
        permissions
      }
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error.toString()
    })
  }

})

/**
 * Accept the deployment requests from remote environment
 */
DeployRouter.post('/in', async (req, res) => {
  const { policies, functions, comment, triggers } = req.body
  if (!policies && !functions) {
    return res.status(422).send('invalid polices & functions')
  }

  // verify deploy token
  const token = req.body?.deploy_token
  const auth = parseToken(token)

  if (!auth) {
    return res.status(401).send('Unauthorized')
  }

  if (auth.type !== 'deploy') {
    return res.status(403).send('Permission Denied')
  }

  // verify deploy token permissions
  const permissions = auth.pns ?? []
  const can_deploy_function = permissions.includes('function')
  const can_deploy_policy = permissions.includes('policy')

  // the source that identified remote environment
  const source = auth.src
  const db = DatabaseAgent.sys_db

  try {
    // write remote policies to db
    if (policies && can_deploy_policy) {
      const data = {
        source,
        status: 'pending',  // 'pending' | 'applied' | 'canceled' 
        type: 'policy',
        data: policies,
        comment,
        created_at: Date.now()
      }

      await db.collection(Constants.cn.deploy_requests).add(data)
    }

    // write remote functions to db
    if (functions && can_deploy_function) {
      const data = {
        source,
        status: 'pending',  // 'pending' | 'deployed' | 'canceled' 
        type: 'function',
        data: functions,
        triggers,
        comment,
        created_at: Date.now()
      }

      await db.collection(Constants.cn.deploy_requests).add(data)
    }

    return res.send({
      code: 0,
      data: 'accepted'
    })
  } catch (error) {
    logger.error(error)
    return res.status(500).send('Internal Server Error: ' + error.toString())
  }
})

/**
 * Apply the deployment requests which accept from remote environment
 */
DeployRouter.post('/apply', async (req, res) => {

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'deploy_request.apply')
  if (code) {
    return res.status(code).send()
  }

  const id = req.body?.id
  if (!id) {
    return res.status(422).send('invalid id')
  }

  const db = DatabaseAgent.sys_db
  const r = await db.collection(Constants.cn.deploy_requests).where({ _id: id }).getOne()
  if (!r.ok || !r.data) {
    return res.status(404).send('deploy request not found')
  }

  const deploy_request = r.data
  const type = deploy_request.type
  assert.ok(['function', 'policy'].includes(type))

  // deploy functions
  if (type === 'function') {
    await deployFunctions(deploy_request.data)

    // deploy triggers if any
    if (deploy_request.triggers) {
      await deployTriggers(deploy_request.triggers)
      await publishTriggers()
    }

    await publishFunctions()
  }

  // deploy policies
  if (type === 'policy') {
    await deployPolicies(deploy_request.data)
    await publishAccessPolicy()
  }

  // update deploy request status to 'deployed'
  await db.collection(Constants.cn.deploy_requests).where({ _id: id }).update({ status: 'deployed' })

  return res.send({
    code: 0,
    data: 'deployed'
  })
})