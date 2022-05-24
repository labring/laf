/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 19:55:26
 * @LastEditTime: 2021-12-07 15:21:42
 * @Description: 
 */


import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { IApplicationData } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { CN_FUNCTIONS } from '../../constants'
import { FunctionActionDef } from '../../actions'
import { DatabaseAgent } from '../../db'


/**
 * Create trigger
 */
export async function handleCreateTrigger(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_accessor.db
  const app: IApplicationData = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.UpdateFunction, app)
  if (code) {
    return res.status(code).send()
  }

  // check params
  const body = req.body
  if (!['event', 'timer'].includes(body.type)) return res.status(422).send('invalid event type, must be one of `event` | `timer`')
  if (body.type === 'timer') {
    if (!body.duration || body.duration <= 0) res.status(422).send('invalid duration')
  }
  if (body.type === 'event') {
    if (!body.event) return res.status(422).send('event can not be empty')
  }

  // get the cloud function
  const func = await db.collection(CN_FUNCTIONS)
    .findOne({ _id: new ObjectId(func_id), appid: app.appid })

  if (!func) return res.status(422).send('function not found')

  // build the trigger data
  const trigger = {
    _id: (new ObjectId()).toHexString(),
    name: body.name,
    type: body.type,
    event: body.event,
    duration: body.duration,
    status: body.status ?? 0,
    desc: body.desc,
    created_at: new Date(),
    updated_at: new Date()
  }

  let update_cmd: any = {
    triggers: [trigger],
    $inc: { version: 1 },
    $set: { updated_at: new Date() }
  }

  if (func.triggers) {
    update_cmd = {
      $addToSet: { triggers: trigger },
      $inc: { version: 1 },
      $set: { updated_at: new Date() }
    }
  }

  // add trigger
  const ret = await db.collection(CN_FUNCTIONS)
    .updateOne({
      _id: new ObjectId(func_id), appid: app.appid
    }, update_cmd)

  return res.send({ data: ret })
}



/**
 * Update trigger
 */
export async function handleUpdateTrigger(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_accessor.db
  const app: IApplicationData = req['parsed-app']
  const func_id = req.params.func_id
  const trigger_id = req.params.trigger_id

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.UpdateFunction, app)
  if (code) {
    return res.status(code).send()
  }

  // get the cloud function
  const func = await db.collection(CN_FUNCTIONS)
    .findOne({ _id: new ObjectId(func_id), appid: app.appid, 'triggers._id': trigger_id })

  if (!func) return res.status(422).send('trigger not found')

  // check params
  const body = req.body
  if (func.type === 'timer') {
    if (!body.duration || body.duration <= 0) res.status(422).send('invalid duration')
  }
  if (func.type === 'event') {
    if (!body.event) return res.status(422).send('event can not be empty')
  }

  // update it
  const ret = await db.collection(CN_FUNCTIONS)
    .updateOne(
      { _id: new ObjectId(func_id), appid: app.appid, 'triggers._id': trigger_id },
      {
        $set: {
          "triggers.$.name": body.name,
          "triggers.$.event": body.event,
          "triggers.$.duration": body.duration,
          "triggers.$.status": body.status ?? 0,
          "triggers.$.desc": body.desc,
          "triggers.$.updated_at": new Date(),
          updated_at: new Date()
        },
        $inc: { version: 1 }
      }
    )

  return res.send({ data: ret })
}


/**
 * Remove trigger
 */
export async function handleRemoveTrigger(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_accessor.db
  const app: IApplicationData = req['parsed-app']
  const func_id = req.params.func_id
  const trigger_id = req.params.trigger_id

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.UpdateFunction, app)
  if (code) {
    return res.status(code).send()
  }

  // get the cloud function
  const func = await db.collection(CN_FUNCTIONS)
    .findOne({ _id: new ObjectId(func_id), appid: app.appid, 'triggers._id': trigger_id })

  if (!func) return res.status(422).send('trigger not found')

  // remove it
  const ret = await db.collection(CN_FUNCTIONS)
    .updateOne(
      { _id: new ObjectId(func_id), appid: app.appid },
      {
        $pull: { triggers: { _id: trigger_id, status: 0 } },
        $inc: { version: 1 },
        $set: { updated_at: new Date() }
      }
    )

  if (ret.matchedCount === 0) {
    return res.status(422).send('cannot remove trigger which status is 1')
  }

  return res.send({ data: ret })
}