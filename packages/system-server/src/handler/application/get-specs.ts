/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-12-27 11:39:53
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationSpecSupport } from '../../support/application-spec'


/**
 * The handler of getting my applications(created & joined)
 */
export async function handleGetSpecs(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const specs = await ApplicationSpecSupport.listSpecs()
  const data = specs.filter(item => item.enabled)

  return res.send({
    data: data
  })
}
