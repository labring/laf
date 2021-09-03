/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-09-03 20:30:54
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'

/**
 * The handler of getting bucket lists of an application
 */
export async function handleGetFileBuckets(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const { FILE_READ } = Constants.permissions
  const code = await checkPermission(uid, FILE_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)

  // get all collections in app db
  const collections = await accessor.db.listCollections().toArray()
  const names = collections.map(coll => coll.name)

  // filter bucket collections, if collection's name ends with '.files' and `[collection].chunks` exists
  const bucket_collections = names.filter(name => {
    if (name.endsWith('.files')) {
      return names.includes(name.replace('.files', '.chunks'))
    }
    return false
  })

  // get bucket names by trim the collection name
  const buckets = bucket_collections.map(name => name.replace('.files', ''))

  return res.send({
    code: 0,
    data: buckets
  })
}