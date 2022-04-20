/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-06 15:03:24
 * @LastEditTime: 2021-10-08 01:39:40
 * @Description: 
 */

import { Request, Response } from 'express'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { ApplicationStruct } from '../../api/application'
import { DatabaseAgent } from '../../db'
import { ObjectId } from 'mongodb'


const { DEPLOY_TARGET_ADD, DEPLOY_TARGET_READ, DEPLOY_TARGET_REMOVE, DEPLOY_TARGET_UPDATE } = Constants.permissions

/**
 * Get deploy targets
 */
export async function handleGetDeployTargets(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const db = DatabaseAgent.db

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const docs = await db.collection(Constants.colls.deploy_targets)
    .find({ appid: app.appid })
    .toArray()

  return res.send({ data: docs })
}

/**
 * Create a deploy target
 */
export async function handleCreateDeployTarget(req: Request, res: Response) {
  const { url, label, token } = req.body
  if (!url) return res.status(422).send('invalid url')
  if (!label) return res.status(422).send('invalid label')
  if (!token) return res.status(422).send('invalid token')

  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const db = DatabaseAgent.db

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_ADD.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(Constants.colls.deploy_targets)
    .insertOne({
      url,
      label,
      token,
      created_at: Date.now(),
      updated_at: Date.now(),
      appid: app.appid
    })

  return res.send({ data: r })
}

/**
 * Update a deploy target
 */
export async function handleUpdateDeployTarget(req: Request, res: Response) {
  const { url, label, token } = req.body
  if (!url) return res.status(422).send('invalid url')
  if (!label) return res.status(422).send('invalid label')
  if (!token) return res.status(422).send('invalid token')

  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const db = DatabaseAgent.db
  const target_id = req.params.target_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(Constants.colls.deploy_targets)
    .updateOne({
      appid: app.appid,
      _id: new ObjectId(target_id)
    }, {
      $set: {
        url,
        label,
        token,
        updated_at: Date.now()
      }
    })

  return res.send({ data: r })
}


/**
 * Remove a deploy target
 */
export async function handleRemoveDeployTarget(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const db = DatabaseAgent.db
  const target_id = req.params.target_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(Constants.colls.deploy_targets)
    .deleteOne({
      appid: app.appid,
      _id: new ObjectId(target_id)
    })

  return res.send({ data: r })
}


