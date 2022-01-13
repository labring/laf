/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2022-01-13 13:52:55
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct, getApplicationDbAccessor } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { logger } from '../../lib/logger'

/**
 * The handler of getting file list
 */
export async function handleGetFiles(req: Request, res: Response) {
  const bucket = req.params.bucket
  const offset = Number(req.query?.offset || 0)
  const limit = Number(req.query?.limit || 20)
  const keyword = req.query?.keyword || undefined

  const requestId = req['requestId']
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const { FILE_READ } = Constants.permissions
  const code = await checkPermission(uid, FILE_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  const accessor = await getApplicationDbAccessor(app)
  try {

    const query = {}
    if (keyword) {
      query['filename'] = keyword
    }

    // get files from app db
    const app_db = accessor.db
    const coll = app_db.collection(`${bucket}.files`)
    const total = await coll.find(query).count()

    const files = await coll
      .find(query, {
        skip: Number(offset),
        limit: Number(limit),
      })
      .sort('uploadDate', 'desc')
      .toArray()

    await accessor.close()
    return res.send({
      code: 0,
      data: files,
      total,
      offset,
      limit
    })
  } catch (err) {
    logger.error(requestId, `get files in ${bucket} got error`, err)
    await accessor.close()
    return res.status(500).send('Internal Server Error')
  }
}