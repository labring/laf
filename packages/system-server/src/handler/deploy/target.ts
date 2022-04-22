/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-06 15:03:24
 * @LastEditTime: 2021-10-08 01:39:40
 * @Description: 
 */

import { Request, Response } from 'express'
import { checkPermission } from '../../support/permission'
import { CN_DEPLOY_TARGETS, CONST_DICTS } from '../../constants'
import { IApplicationData } from '../../support/application'
import { DatabaseAgent } from '../../db'
import { ObjectId } from 'mongodb'


const { DEPLOY_TARGET_ADD, DEPLOY_TARGET_READ, DEPLOY_TARGET_REMOVE, DEPLOY_TARGET_UPDATE } = CONST_DICTS.permissions

/**
 * Get deploy targets
 */
export async function handleGetDeployTargets(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']
  const db = DatabaseAgent.db

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const docs = await db.collection(CN_DEPLOY_TARGETS)
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
  const app: IApplicationData = req['parsed-app']
  const db = DatabaseAgent.db

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_ADD.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(CN_DEPLOY_TARGETS)
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
  const app: IApplicationData = req['parsed-app']
  const db = DatabaseAgent.db
  const target_id = req.params.target_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(CN_DEPLOY_TARGETS)
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
  const app: IApplicationData = req['parsed-app']
  const db = DatabaseAgent.db
  const target_id = req.params.target_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(CN_DEPLOY_TARGETS)
    .deleteOne({
      appid: app.appid,
      _id: new ObjectId(target_id)
    })

  return res.send({ data: r })
}


