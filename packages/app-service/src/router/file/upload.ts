/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-19 15:59:38
 * @LastEditTime: 2021-08-19 17:17:28
 * @Description:
 */


import * as express from 'express'
import { checkFileOperationToken, FS_OPERATION } from './utils'
import { logger } from '../../lib/logger'
import { createFileStorage } from '../../lib/storage'
import Config from '../../config'

/**
 * Uploads file to storage
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 */
export async function handleUploadFile(req: express.Request, res: express.Response) {
  const auth = req['auth']
  const bucket_name = req.params.bucket

  // check file operation token if bucket is not 'public'
  if (bucket_name !== 'public' || Config.FILE_SYSTEM_ENABLE_UNAUTHORIZED_UPLOAD === 'off') {
    const [code, message] = checkFileOperationToken(bucket_name, req.query?.token as string, FS_OPERATION.CREATE)
    if (code) {
      return res.status(code).send(message)
    }
  }

  // check given file
  const file = req.file
  if (!file) {
    return res.status(422).send('file cannot be empty')
  }

  // save file to storage
  const storage = createFileStorage(bucket_name)
  const metadata = {
    original_name: file.originalname,
    created_by: auth?.uid,
    bucket: bucket_name,
    created_at: Date.now(),
    contentType: file.mimetype
  }

  storage.save(file.path, file.filename, metadata)
    .then(saved => {
      if (saved?.fullpath) {
        delete saved.fullpath
      }
      res.send({
        code: 0,
        data: saved
      })
    })
    .catch(err => {
      logger.error('upload file to gridfs stream occurred error', err)
      res.status(500).send('internal server error')
    })
}

