/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-08-31 15:44:33
 * @Description: 
 */

import { Request, Response } from 'express'
import { getMyApplications, getMyJoinedApplications } from '../../api/application'

/**
 * The handler of getting profile
 */
export async function handleMyApplications(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const created = await getMyApplications(uid)
  const joined = await getMyJoinedApplications(uid)

  return res.send({
    data: {
      created,
      joined
    }
  })
}