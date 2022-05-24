/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 23:09:23
 * @LastEditTime: 2021-12-07 15:02:13
 * @Description: 
 */


import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { IApplicationData } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { IPolicyData } from '../../support/policy'
import { CN_POLICIES } from '../../constants'
import { DatabaseActionDef } from '../../actions'
import { DatabaseAgent } from '../../db'
import { hashFunctionCode } from '../../support/util-passwd'



/**
 * Update a policy
 */
export async function handleUpdatePolicy(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const app: IApplicationData = req['parsed-app']
  const policy_id = req.params.policy_id

  // check permission
  const code = await checkPermission(uid, DatabaseActionDef.UpdatePolicy, app)
  if (code) {
    return res.status(code).send()
  }

  // get the policy
  const policy = await db.collection<IPolicyData>(CN_POLICIES)
    .findOne({
      _id: new ObjectId(policy_id),
      appid: app.appid
    })

  if (!policy) return res.status(422).send('policy not found')
  const body = req.body

  // build the policy data
  const data = {
    name: body.name ?? policy.name,
    description: body.description ?? policy.description,
    status: body.status ?? policy.status,
    injector: body.injector ?? policy.injector,
    updated_at: new Date(),
  }

  // do db query
  const ret = await db.collection(CN_POLICIES)
    .updateOne({
      appid: app.appid,
      _id: new ObjectId(policy_id)
    }, {
      $set: data
    })

  return res.send({
    data: ret
  })
}


/**
 * Update policy rules
 */
export async function handleUpdatePolicyRules(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const app: IApplicationData = req['parsed-app']
  const policy_id = req.params.policy_id

  // check permission
  const code = await checkPermission(uid, DatabaseActionDef.UpdatePolicy, app)
  if (code) {
    return res.status(code).send()
  }

  const body = req.body
  if (!body.rules) return res.status(422).send('rules cannot be empty')

  // get the policy
  const policy = await db.collection(CN_POLICIES)
    .findOne({
      _id: new ObjectId(policy_id),
      appid: app.appid
    })

  if (!policy) return res.status(422).send('policy not found')

  // build the policy data
  const data = {
    rules: body.rules,
    hash: hashFunctionCode(JSON.stringify(body.rules)),
    updated_at: new Date(),
  }

  // do db query
  const ret = await db.collection(CN_POLICIES)
    .updateOne({
      appid: app.appid,
      _id: new ObjectId(policy_id)
    }, {
      $set: data
    })

  return res.send({
    data: ret
  })
}