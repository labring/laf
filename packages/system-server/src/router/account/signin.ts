/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-30 15:25:39
 * @Description: 
 */

import { Request, Response } from 'express'
import { getToken } from '../../lib/utils/token'
import { hashPassword } from '../../lib/utils/hash'
import { DatabaseAgent } from '../../lib/db-agent'
import Config from '../../config'
import { Constants } from '../../constants'
import * as assert from 'assert'

/**
 * The handler of sign in
 */
export async function handleSignIn(req: Request, res: Response) {
  const { username, password } = req.body

  const login_failed_error = {
    code: 1,
    error: 'invalid username or password'
  }

  if (!username || !password) {
    return res.send(login_failed_error)
  }
  const db = DatabaseAgent.sys_db
  const ret = await db.collection(Constants.cn.accounts)
    .withOne({
      query: db
        .collection(Constants.cn.password)
        .where({ password: hashPassword(password), type: 'login' }),
      localField: '_id',
      foreignField: 'uid'
    })
    .where({ username })
    .merge({ intersection: true })

  assert.ok(ret.ok)

  if (!ret.data.length) {
    return res.send(login_failed_error)
  }

  const account = ret.data[0]

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