/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2022-01-13 13:51:32
 * @Description: 
 */

import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { permissions } from '../../permissions'
import { Request, Response } from 'express'


/**
 * Get indexes of collection
 */
export async function handleGetIndexesOfCollection(req: Request, res: Response) {
  const collectionName = req.query?.collection
  if (!collectionName) {
    return res.status(422).send('collection cannot be empty')
  }

  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, permissions.DATABASE_MANAGE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)

  const r = await accessor.db.collection(collectionName as string).indexes()

  await accessor.close()
  return res.send(r)
}