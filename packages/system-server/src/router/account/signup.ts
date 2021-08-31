/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-31 14:37:26
 * @Description: 
 */

import { Request, Response } from 'express'
import { hashPassword } from '../../utils/hash'
import { DatabaseAgent } from '../../lib/db-agent'
import { Constants } from '../../constants'


/**
 * The handler of sign up
 */
export async function handleSignUp(req: Request, res: Response) {

  const db = DatabaseAgent.sys_db

  const { username, password } = req.body
  if (!username || !password) {
    return res.send({ error: 'username or password cannot be empty' })
  }

  // check if account exists
  const { total } = await db.collection(Constants.cn.accounts).where({ username }).count()
  if (total > 0) {
    return res.send({ error: 'account already exists' })
  }

  // add account
  const r = await db.collection(Constants.cn.accounts)
    .add({
      username,
      password: hashPassword(password),
      created_at: Date.now(),
      updated_at: Date.now()
    })

  return res.send({
    code: 0,
    data: {
      uid: r.id
    }
  })
}
