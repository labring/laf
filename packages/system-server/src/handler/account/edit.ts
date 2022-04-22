/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-12-07 13:54:45
 * @Description: 
 */

import { Request, Response } from 'express'
import { DatabaseAgent } from '../../db'
import { CN_ACCOUNTS } from '../../constants'
import { ObjectId } from 'mongodb'


/**
 * The handler of editing account
 */
export async function handleEdit(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db

  // check if params valid
  const { avatar, name } = req.body
  if (!uid)
    return res.status(401).send()

  // check if uid valid
  const account = await db.collection(CN_ACCOUNTS)
    .findOne({ _id: new ObjectId(uid) })

  if (!account) {
    return res.status(422).send('account not found')
  }

  // update account
  const data = {
    updated_at: new Date()
  }

  // update avatar if provided
  if (avatar && avatar != account.avatar) {
    data['avatar'] = avatar
  }

  // update name if provided
  if (name && name != account.name) {
    data['name'] = name
  }

  const r = await db.collection(CN_ACCOUNTS)
    .updateOne({
      _id: new ObjectId(uid)
    }, {
      $set: data
    })

  return res.send({
    code: 0,
    data: {
      ...r,
      uid
    }
  })
}