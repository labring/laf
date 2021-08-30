/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-08-30 16:24:44
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationById, getApplicationDbAccessor } from '../../api/application'
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

  const appid = req.params.appid
  const app = await getApplicationById(appid)
  if (!app) {
    return res.status(422).send('app not found')
  }

  // check permission
  const { FILE_READ } = Constants.permissions
  const code = await checkPermission(req['auth']?.uid, FILE_READ.name, app)
  if (code) {
    return res.status(code).send()
  }

  try {
    const accessor = await getApplicationDbAccessor(app)

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

    return res.send({
      code: 0,
      data: files,
      total,
      offset,
      limit
    })
  } catch (err) {
    logger.error(requestId, `get files in ${bucket} got error`, err)
    return res.status(500).send('Internal Server Error')
  }
}