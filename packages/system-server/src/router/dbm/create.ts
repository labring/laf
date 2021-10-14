/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2021-10-14 14:03:32
 * @Description: 
 */

import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { permissions } from '../../constants/permissions'
import { Request, Response } from 'express'


/**
 * Create collection
 */
export async function handleCreateCollection(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, permissions.DATABASE_MANAGE.name, app)
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
    return res.send({ code: 0, data: 'ok' })
  } catch (error) {
    return res.status(400).send({
      error: error.message,
      code: error.codeName
    })
  }
}