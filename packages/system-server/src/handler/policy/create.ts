/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 23:19:36
 * @LastEditTime: 2021-12-07 14:58:57
 * @Description: 
 */

import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ApplicationStruct } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { Constants } from '../../constants'
import { permissions } from '../../permissions'
import { DatabaseAgent } from '../../db'
import { hashFunctionCode } from '../../support/util-passwd'

const { POLICY_ADD } = permissions

/**
 * Create policy
 */
export async function handleCreatePolicy(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, POLICY_ADD.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check params
  const body = req.body
  if (!body.name) return res.status(422).send('name cannot be empty')
  if (!body.rules) return res.status(422).send('rules cannot be empty')

  // policy name should be unique
  const total = await db.collection(Constants.colls.policies)
    .countDocuments({ name: body.name, appid: app.appid })

  if (total) return res.status(422).send('policy name already exists')

  // build the policy data
  const policy = {
    name: body.name,
    description: body.description,
    status: body.status ? 1 : 0,
    rules: body.rules,
    injector: body.injector,
    hash: hashFunctionCode(JSON.stringify(body.rules)),
    created_at: new Date(),
    updated_at: new Date(),
    created_by: new ObjectId(uid),
    appid: app.appid
  }

  // add policy
  const ret = await db.collection(Constants.colls.policies)
    .insertOne(policy)

  return res.send({ data: ret })
}