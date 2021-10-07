/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-08 01:02:45
 * @Description: 
 */

import { Request, Response } from 'express'
import { hashPassword } from '../../utils/hash'
import { DatabaseAgent } from '../../lib/db-agent'
import { Constants } from '../../constants'
import Config from '../../config'


/**
 * The handler of sign up
 */
export async function handleSignUp(req: Request, res: Response) {

  const db = DatabaseAgent.db

  const { username, password, name } = req.body
  if (!username || !password) {
    return res.send({ error: 'username or password cannot be empty' })
  }

  if (!name) {
    return res.send({ error: 'name cannot be empty' })
  }

  // check if account exists
  const total = await db.collection(Constants.cn.accounts).countDocuments({ username })
  if (total > 0) {
    return res.send({ error: 'account already exists' })
  }

  // add account
  const r = await db.collection(Constants.cn.accounts)
    .insertOne({
      username,
      quota: {
        app_count: Config.ACCOUNT_DEFAULT_APP_QUOTA
      },
      name: name,
      password: hashPassword(password),
      created_at: Date.now(),
      updated_at: Date.now()
    })

  return res.send({
    code: 0,
    data: {
      uid: r.insertedId.toHexString()
    }
  })
}
