/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-28 23:00:50
 * @Description: 
 */

import { Request, Response } from 'express'
import { hashPassword } from '../../lib/utils/hash'
import { DatabaseAgent } from '../../lib/db-agent'
import { Constants } from '../../constants'


/**
 * The handler of sign up
 */
export async function handleSignUp(req: Request, res: Response) {

  const db = DatabaseAgent.sys_db

  const { username, password, avatar, name, roles } = req.body
  if (!username || !password) {
    return res.send({
      code: 1,
      error: 'username or password cannot be empty'
    })
  }

  // check if account exists
  const { total } = await db.collection(Constants.cn.accounts).where({ username }).count()
  if (total > 0) {
    return res.send({
      code: 1,
      error: 'account already exists'
    })
  }

  // check if roles are valid
  const { total: valid_count } = await db.collection(Constants.cn.roles)
    .where({
      name: db.command.in(roles)
    }).count()

  if (valid_count !== roles.length) {
    return res.send({
      code: 1,
      error: 'invalid roles'
    })
  }

  // add admin
  const r = await db.collection(Constants.cn.accounts)
    .add({
      username,
      name: name ?? null,
      avatar: avatar ?? null,
      roles: roles ?? [],
      created_at: Date.now(),
      updated_at: Date.now()
    })

  // add admin password
  await db.collection(Constants.cn.password)
    .add({
      uid: r.id,
      password: hashPassword(password),
      type: 'login',
      created_at: Date.now(),
      updated_at: Date.now()
    })

  return res.send({
    code: 0,
    data: {
      ...r,
      uid: r.id
    }
  })
}
