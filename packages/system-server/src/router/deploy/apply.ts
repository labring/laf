/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:34:45
 * @LastEditTime: 2021-09-06 14:24:30
 * @Description: 
 */

import { Request, Response } from 'express'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { getApplicationByAppid } from '../../api/application'
import { DatabaseAgent } from '../../lib/db-agent'
import * as assert from 'assert'
import { deployFunctions, publishFunctions } from '../../api/function'
import { publishTriggers } from '../../api/trigger'
import { deployPolicies, publishAccessPolicy } from '../../api/policy'


/**
 * Apply the deployment requests which accept from remote environment
 */
export async function handleApplyDeployRequest(req: Request, res: Response) {
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app) {
    return res.status(422).send('app not found')
  }

  // check permission
  const { DEPLOY_REQUEST_APPLY } = Constants.permissions
  const code = await checkPermission(req['auth']?.uid, DEPLOY_REQUEST_APPLY.name, app)
  if (code) {
    return res.status(code).send()
  }

  const id = req.body?.id
  if (!id)
    return res.status(422).send('invalid id')

  const db = DatabaseAgent.sys_db
  const r = await db.collection(Constants.cn.deploy_requests)
    .where({ _id: id, appid })
    .getOne()

  if (!r.ok || !r.data) {
    return res.status(404).send('deploy request not found')
  }

  const deploy_request = r.data
  const type = deploy_request.type
  assert.ok(['function', 'policy'].includes(type))

  // deploy functions
  if (type === 'function') {
    await deployFunctions(deploy_request.data)
    await publishFunctions(app)
    await publishTriggers(app)
  }

  // deploy policies
  if (type === 'policy') {
    await deployPolicies(deploy_request.data)
    await publishAccessPolicy(app)
  }

  // update deploy request status to 'deployed'
  await db.collection(Constants.cn.deploy_requests)
    .where({ _id: id, appid })
    .update({ status: 'deployed' })

  return res.send({
    code: 0,
    data: 'deployed'
  })
}