/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 23:09:23
 * @LastEditTime: 2021-09-09 14:44:10
 * @Description: 
 */


import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { PolicyStruct } from '../../api/policy'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'
import { hashFunctionCode } from '../../utils/hash'

const { POLICY_UPDATE } = permissions


/**
 * Update a policy
 */
export async function handleUpdatePolicy(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_db
  const app: ApplicationStruct = req['parsed-app']
  const policy_id = req.params.policy_id

  // check permission
  const code = await checkPermission(uid, POLICY_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // get the policy
  const { data: policy } = await db.collection(Constants.cn.policies)
    .where({ _id: policy_id, appid: app.appid })
    .getOne<PolicyStruct>()

  if (!policy) return res.status(422).send('policy not found')
  const body = req.body

  // build the policy data
  const data = {
    name: body.name ?? policy.name,
    description: body.description ?? policy.description,
    status: body.status ?? policy.status,
    injector: body.injector ?? policy.injector,
    updated_at: Date.now(),
  }

  // do db query
  const ret = await db.collection(Constants.cn.policies)
    .where({ appid: app.appid, _id: policy_id })
    .update(data)

  if (ret.error) {
    return res.status(400).send(ret.error)
  }

  return res.send({
    data: ret
  })
}


/**
 * Update policy rules
 */
export async function handleUpdatePolicyRules(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_db
  const app: ApplicationStruct = req['parsed-app']
  const policy_id = req.params.policy_id

  // check permission
  const code = await checkPermission(uid, POLICY_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const body = req.body
  if (!body.rules) return res.status(422).send('rules cannot be empty')

  // get the policy
  const { data: policy } = await db.collection(Constants.cn.policies)
    .where({ _id: policy_id, appid: app.appid })
    .getOne()

  if (!policy) return res.status(422).send('policy not found')

  // build the policy data
  const data = {
    rules: db.command.set(body.rules),
    hash: hashFunctionCode(JSON.stringify(body.rules)),
    updated_at: Date.now(),
  }

  // do db query
  const ret = await db.collection(Constants.cn.policies)
    .where({ appid: app.appid, _id: policy_id })
    .update(data)

  if (ret.error) {
    return res.status(400).send(ret.error)
  }

  return res.send({
    data: ret
  })
}