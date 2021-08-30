/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-28 22:52:21
 * @Description: 
 */

import { Request, Response } from 'express'
import { getPermissionsByAccountId } from '../../api/permission'
import { DatabaseAgent } from '../../lib/db-agent'
import { Constants } from '../../constants'

/**
 * The handler of getting profile
 */
export async function handleProfile(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid) {
    return res.status(401)
  }

  const db = DatabaseAgent.sys_db

  const { data: account } = await db.collection(Constants.cn.accounts)
    .where({ _id: uid })
    .getOne()

  if (!account) {
    return res.status(422).send('account not found')
  }

  const { permissions } = await getPermissionsByAccountId(account._id)

  return res.send({
    code: 0,
    data: {
      ...account,
      permissions
    }
  })
}