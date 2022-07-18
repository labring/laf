/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-12-07 13:54:20
 * @Description: 
 */

import { Request, Response } from 'express'
import { hashPassword } from '../../support/util-passwd'
import { DatabaseAgent } from '../../db'
import { CN_ACCOUNTS } from '../../constants'
import Config from '../../config'


/**
 * The handler of sign up
 */
export async function handleSignUp(req: Request, res: Response) {
  const signUpMode = Config.ACCOUNT_SIGNUP_MODE
  if (signUpMode === 1) {
    return res.send({ error: 'account prohibit registration' })
  }

  const db = DatabaseAgent.db

  const { username, password, name } = req.body
  if (!username || !password) {
    return res.send({ error: 'username or password cannot be empty' })
  }

  if (!name) {
    return res.send({ error: 'name cannot be empty' })
  }

  // check if account exists
  const total = await db.collection(CN_ACCOUNTS).countDocuments({ username })
  if (total > 0) {
    return res.send({ error: 'account already exists' })
  }

  // add account
  const r = await db.collection(CN_ACCOUNTS)
    .insertOne({
      username,
      quota: {
        app_count: Config.ACCOUNT_DEFAULT_APP_QUOTA
      },
      name: name,
      password: hashPassword(password),
      created_at: new Date(),
      updated_at: new Date()
    })

  return res.send({
    code: 0,
    data: {
      uid: r.insertedId.toHexString()
    }
  })
}
