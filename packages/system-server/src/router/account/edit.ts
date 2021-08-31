/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-31 15:35:11
 * @Description: 
 */

import { Request, Response } from 'express'
import { DatabaseAgent } from '../../lib/db-agent'
import { Constants } from '../../constants'


/**
 * The handler of editing account
 */
export async function handleEdit(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_db

  // check if params valid
  const { avatar, name } = req.body
  if (!uid)
    return res.status(401).send()

  // check if uid valid
  const { data: account } = await db.collection(Constants.cn.accounts)
    .where({ _id: uid })
    .getOne()

  if (!account) {
    return res.status(422).send('account not found')
  }

  // update account
  const data = {
    updated_at: Date.now()
  }

  // update avatar if provided
  if (avatar && avatar != account.avatar) {
    data['avatar'] = avatar
  }

  // update name if provided
  if (name && name != account.name) {
    data['name'] = name
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