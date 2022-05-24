/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2022-01-13 13:50:37
 * @Description: 
 */

import { IApplicationData, getApplicationDbAccessor } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { DatabaseActionDef } from '../../actions'
import { Request, Response } from 'express'


/**
 * Create collection
 */
export async function handleCreateCollection(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, DatabaseActionDef.CreateCollection, app)
  if (code) {
    return res.status(code).send()
  }

  const collectionName = req.body?.collectionName
  if (!collectionName) {
    return res.status(422).send('collection name got empty')
  }

  const accessor = await getApplicationDbAccessor(app)

  const db = accessor.db
  try {
    await db.createCollection(collectionName)
    await accessor.close()
    return res.send({ code: 0, data: 'ok' })
  } catch (error) {
    await accessor.close()
    return res.status(400).send({
      error: error.message,
      code: error.codeName
    })
  }
}