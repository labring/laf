/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-09-03 20:34:43
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { GridFSBucket } from 'mongodb'

/**
 * The handler of deleting a bucket
 */
export async function handleDeleteFileBuckets(req: Request, res: Response) {
  const bucketName = req.params?.bucket

  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const { FILE_BUCKET_REMOVE } = Constants.permissions
  const code = await checkPermission(uid, FILE_BUCKET_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)
  const bucket = new GridFSBucket(accessor.db, { bucketName: bucketName })

  const files = await bucket.find({}, { limit: 1 }).toArray()
  if (files.length) {
    return res.send({
      code: 1,
      error: `cannot delete a bucket which not empty`
    })
  }

  await bucket.drop()

  return res.send({
    code: 0,
    data: bucketName
  })
}