/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-28 22:53:24
 * @Description: 
 */

import { Request, Response } from 'express'
import { hashPassword } from '../../lib/utils/hash'
import { DatabaseAgent } from '../../lib/db-agent'
import { Constants } from '../../constants'


/**
 * The handler of editing account
 */
export async function handleEdit(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_db

  // check if params valid
  const { password, avatar, name, roles } = req.body
  if (!uid) {
    return res.status(401)
  }

  // check if uid valid
  const { data: account } = await db.collection(Constants.cn.accounts)
    .where({ _id: uid })
    .getOne()

  if (!account) {
    return res.status(422).send('account not found')
  }

  // check if roles are valid
  const { total: valid_count } = await db.collection(Constants.cn.roles)
    .where({ name: db.command.in(roles) })
    .count()

  if (valid_count !== roles.length) {
    return res.status(422).send('invalid roles')
  }

  // update account
  const data = {
    updated_at: Date.now()
  }

  // update password if provided
  if (password) {
    data['password'] = hashPassword(password)
  }

  // update avatar if provided
  if (avatar && avatar != account.avatar) {
    data['avatar'] = avatar
  }

  // update name if provided
  if (name && name != account.name) {
    data['name'] = name
  }

  // update roles if provided
  if (roles) {
    data['roles'] = roles
  }

  const r = await db.collection(Constants.cn.accounts)
    .where({ _id: uid })
    .update(data)

  return res.send({
    code: 0,
    data: {
      ...r,
      uid
    }
  })
}