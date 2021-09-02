/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-08-30 16:22:03
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { GridFSBucket } from 'mongodb'

/**
 * The handler of creating a bucket
 */
export async function handleCreateFileBuckets(req: Request, res: Response) {
  const bucketName = req.body?.bucket
  if (!bucketName) {
    return res.status(422).send('invalid bucket name')
  }

  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const { FILE_BUCKET_ADD } = Constants.permissions
  const code = await checkPermission(req['auth']?.uid, FILE_BUCKET_ADD.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)
  const bucket = new GridFSBucket(accessor.db, { bucketName: bucketName })

  // invoke openUploadStream just for creating a new bucket, ignore the execution result
  bucket.openUploadStream('placeholder_none_sense')

  return res.send({
    code: 0,
    data: bucketName
  })
}