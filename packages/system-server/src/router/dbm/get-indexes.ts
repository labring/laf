/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2021-08-30 16:32:58
 * @Description: 
 */

import { getApplicationById, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { permissions } from '../../constants/permissions'
import { Request, Response } from 'express'


/**
 * Get indexes of collection
 */
export async function handleGetIndexesOfCollection(req: Request, res: Response) {
  const collectionName = req.query?.collection
  if (!collectionName) {
    return res.status(422).send('collection cannot be empty')
  }

  const appid = req.params.appid
  const app = await getApplicationById(appid)
  if (!app) {
    return res.status(422).send('app not found')
  }

  // check permission
  const code = await checkPermission(req['auth']?.uid, permissions.DATABASE_MANAGE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)

  const r = await accessor.db.collection(collectionName as string).indexes()
  return res.send(r)
}