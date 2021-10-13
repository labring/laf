/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2021-10-13 21:30:55
 * @Description: 
 */

import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { permissions } from '../../constants/permissions'
import { Request, Response } from 'express'


/**
 * Get collection name lists
 */
export async function handleCollectionList(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, permissions.DATABASE_MANAGE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)

  const collections = await accessor.db.listCollections().toArray()
  const names = collections
    .filter(coll => !coll.name.startsWith('__'))
    // .map(coll => coll.name)
    .sort()

  return res.send(names)
}