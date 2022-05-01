/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-08 01:01:49
 * @Description: 
 */

import { Request, Response } from 'express'
import { DatabaseAgent } from '../../db'
import { CN_ACCOUNTS } from '../../constants'
import { ObjectId } from 'mongodb'

/**
 * The handler of getting profile
 */
export async function handleProfile(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const db = DatabaseAgent.db

  const account = await db.collection(CN_ACCOUNTS)
    .findOne({ _id: new ObjectId(uid) })

  if (!account) {
    return res.status(422).send('account not found')
  }

  delete account.password
  return res.send({
    code: 0,
    data: account
  })
}