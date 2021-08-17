/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 19:11:24
 * @Description: 
 */

import * as express from 'express'
import { checkPermission } from '../../api/permission'
import { DatabaseAgent } from '../../lib/db-agent'
import { logger } from '../../lib/logger'
import { GridFSBucket, ObjectId } from 'mongodb'

const accessor = DatabaseAgent.app_accessor

export const FileRouter = express.Router()

/**
 * Get file bucket list
 */
FileRouter.get('/buckets', async (req, res) => {
  const requestId = req['requestId']
  logger.info(requestId, `get /buckets`)

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'file.read')
  if (code) {
    return res.status(code).send()
  }

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
})


/**
 * Get file list in bucket
 */
FileRouter.get('/:bucket/files', async (req, res) => {
  const bucket = req.params.bucket
  const offset = req.query?.offset || 0
  const limit = req.query?.limit || 20

  const requestId = req['requestId']
  logger.info(requestId, `get /${bucket}/files`)

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'file.read')
  if (code) {
    return res.status(code).send()
  }

  try {
    // get files from app db
    const coll = DatabaseAgent.app_db.collection(`${bucket}.files`)
    const { total } = await coll.count()

    const r = await coll
      .skip(Number(offset))
      .limit(Number(limit))
      .get()

    if (!r.ok) {
      return res.send({
        code: 1,
        error: r.error
      })
    }

    return res.send({
      code: 0,
      data: r.data,
      total,
      offset,
      limit
    })
  } catch (err) {
    logger.error(requestId, `get files in ${bucket} got error`, err)
    return res.status(500).send('Internal Server Error')
  }
})

/**
 * delete file in bucket by file id
 */
FileRouter.delete('/:bucket/:id', async (req, res) => {
  const bucket_name = req.params.bucket
  const file_id = req.params.id

  const requestId = req['requestId']
  logger.info(requestId, `delete /${bucket_name}/${file_id}`)

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'file.delete')
  if (code) {
    return res.status(code).send()
  }

  // delete file
  try {
    const bucket = new GridFSBucket(accessor.db, { bucketName: bucket_name })
    await bucket.delete(new ObjectId(file_id))

    return res.send({
      code: 0,
      data: file_id
    })
  } catch (error) {
    logger.error(requestId, `delete file ${file_id} in ${bucket_name} got error`, error)
    return res.status(500).send('Internal Server Error')
  }
})
