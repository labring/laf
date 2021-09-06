/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-06 15:03:24
 * @LastEditTime: 2021-09-06 15:42:46
 * @Description: 
 */

import { Request, Response } from 'express'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { ApplicationStruct } from '../../api/application'
import { DatabaseAgent } from '../../lib/db-agent'


const { DEPLOY_TARGET_ADD, DEPLOY_TARGET_READ, DEPLOY_TARGET_REMOVE, DEPLOY_TARGET_UPDATE } = Constants.permissions

/**
 * Get deploy targets
 */
export async function handleGetDeployTargets(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const db = DatabaseAgent.sys_db

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(Constants.cn.deploy_targets)
    .where({ appid: app.appid })
    .get()

  if (r.error) {
    return res.status(400).send({ error: r.error })
  }

  return res.send({ data: r.data })
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
  const db = DatabaseAgent.sys_db

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_ADD.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(Constants.cn.deploy_targets)
    .add({
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
  const db = DatabaseAgent.sys_db
  const target_id = req.params.target_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(Constants.cn.deploy_targets)
    .where({ appid: app.appid, _id: target_id })
    .update({
      url,
      label,
      token,
      updated_at: Date.now()
    })

  return res.send({ data: r })
}


/**
 * Remove a deploy target
 */
export async function handleRemoveDeployTarget(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const db = DatabaseAgent.sys_db
  const target_id = req.params.target_id

  // check permission
  const code = await checkPermission(uid, DEPLOY_TARGET_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const r = await db.collection(Constants.cn.deploy_targets)
    .where({ appid: app.appid, _id: target_id })
    .remove()

  return res.send({ data: r })
}


