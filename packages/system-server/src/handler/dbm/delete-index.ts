/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2022-01-13 13:55:26
 * @Description: 
 */

import { IApplicationData, getApplicationDbAccessor } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { DatabaseActionDef } from '../../actions'
import { Request, Response } from 'express'


/**
 * Delete index of collection
 */
export async function handleDeleteIndex(req: Request, res: Response) {
  const collectionName = req.query?.collection
  if (!collectionName) {
    return res.status(422).send('collection cannot be empty')
  }

  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, DatabaseActionDef.UpdateCollection, app)
  if (code) {
    return res.status(code).send()
  }

  const indexName = req.query?.index
  if (!indexName) {
    return res.status(422).send('invalid index name')
  }

  const accessor = await getApplicationDbAccessor(app)
  try {
    const r = await accessor.db
      .collection(collectionName as string)
      .dropIndex(indexName as string)

    await accessor.close()
    return res.send(r)
  } catch (error) {
    await accessor.close()
    return res.status(400).send(error)
  }
}