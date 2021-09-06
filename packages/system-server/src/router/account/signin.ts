/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-31 17:44:11
 * @Description: 
 */

import { Request, Response } from 'express'
import { getToken } from '../../utils/token'
import { hashPassword } from '../../utils/hash'
import { DatabaseAgent } from '../../lib/db-agent'
import Config from '../../config'
import { Constants } from '../../constants'

/**
 * The handler of sign in
 */
export async function handleSignIn(req: Request, res: Response) {
  const { username, password } = req.body
  if (!username || !password) {
    return res.send({ error: 'username and password are required' })
  }

  const db = DatabaseAgent.sys_db
  const { data: account } = await db.collection(Constants.cn.accounts)
    .where({ username, password: hashPassword(password) })
    .getOne()

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