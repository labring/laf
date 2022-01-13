/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2022-01-13 13:52:41
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { logger } from '../../lib/logger'
import { GridFSBucket, ObjectId } from 'mongodb'

/**
 * The handler of deleting a file
 */
export async function handleDeleteFile(req: Request, res: Response) {
  const bucket_name = req.params.bucket
  const file_id = req.params.id
  const requestId = req['requestId']
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const { FILE_REMOVE } = Constants.permissions
  const code = await checkPermission(uid, FILE_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)

  // delete file
  try {

    const bucket = new GridFSBucket(accessor.db, { bucketName: bucket_name })
    await bucket.delete(new ObjectId(file_id))

    await accessor.close()
    return res.send({
      code: 0,
      data: file_id
    })
  } catch (error) {
    logger.error(requestId, `delete file ${file_id} in ${bucket_name} got error`, error)
    await accessor.close()
    return res.status(500).send('Internal Server Error')
  }
}