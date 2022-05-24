/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 23:09:23
 * @LastEditTime: 2021-10-08 01:40:46
 * @Description: 
 */


import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { IApplicationData } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { CN_FUNCTIONS } from '../../constants'
import { FunctionActionDef } from '../../actions'
import { DatabaseAgent } from '../../db'

/**
 * Remove a function by id
 */
export async function handleRemoveFunctionById(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(req['auth']?.uid, FunctionActionDef.DeleteFunction, app)
  if (code) {
    return res.status(code).send()
  }

  // do db query
  const ret = await db.collection(CN_FUNCTIONS)
    .deleteOne({
      _id: new ObjectId(func_id),
      appid: app.appid,
      status: 0
    })

  return res.send({
    data: ret
  })
}