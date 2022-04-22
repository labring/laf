/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-08 01:02:25
 * @Description: 
 */

import { Request, Response } from 'express'
import { getToken } from '../../support/token'
import { hashPassword } from '../../support/util-passwd'
import { DatabaseAgent } from '../../db'
import Config from '../../config'
import { CN_ACCOUNTS } from '../../constants'

/**
 * The handler of sign in
 */
export async function handleSignIn(req: Request, res: Response) {
  const { username, password } = req.body
  if (!username || !password) {
    return res.send({ error: 'username and password are required' })
  }

  const db = DatabaseAgent.db
  const account = await db.collection(CN_ACCOUNTS)
    .findOne({ username, password: hashPassword(password) })

  if (!account) {
    return res.send({ error: 'invalid username or password' })
  }
  const expire = Math.floor(Date.now() / 1000) + 60 * 60 * Config.TOKEN_EXPIRED_TIME
  const payload = {
    uid: account._id,
    exp: expire
  }
  const access_token = getToken(payload)

  return res.send({
    code: 0,
    data: {
      access_token,
      username,
      uid: account._id,
      expire
    }
  })
}