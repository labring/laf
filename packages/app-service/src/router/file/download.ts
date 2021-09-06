/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-19 16:10:27
 * @LastEditTime: 2021-08-19 17:04:29
 * @Description: 
 */

import * as express from 'express'
import { checkFileOperationToken, FS_OPERATION, generateETag } from './utils'
import Config from '../../config'
import { logger } from '../../lib/logger'
import { createFileStorage } from '../../lib/storage'


/**
 * Downloads file by bucket name and filename
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 */
export async function handleDownloadFile(req: express.Request, res: express.Response) {

  const { bucket: bucket_name, filename } = req.params

  // check file operation token if bucket is not 'public'
  if (bucket_name !== 'public') {
    const [code, message] = checkFileOperationToken(bucket_name, req.query?.token as string, FS_OPERATION.READ, filename)
    if (code) {
      return res.status(code).send(message)
    }
  }

  try {
    const storage = createFileStorage(bucket_name)
    const stream = storage.createReadStream(filename)

    const file = await storage.info(filename)

    if (!file) {
      return res.status(404).send('Not Found')
    }

    // set content type in response header 
    if (file?.contentType) {
      res.contentType(file.contentType)
    }

    // process cache policy with `Cache-Control` andy `Last-Modified`
    if (Config.FILE_SYSTEM_HTTP_CACHE_CONTROL) {
      res.set('Cache-Control', Config.FILE_SYSTEM_HTTP_CACHE_CONTROL)
    }

    if (file?.upload_date) {
      res.set('Last-Modified', file.upload_date.toUTCString())
    }

    // process cache policy with `ETag` & `If-None-Match`
    const etag = generateETag(file.size, file.upload_date.toString(), file.filename)
    res.set('ETag', etag)
    if (req.header('If-None-Match') === etag) {
      res.status(304).send('Not Modified')
      return
    }

    res.set('x-bucket', bucket_name)
    res.set('x-uri', `/${bucket_name}/${filename}`)
    return stream.pipe(res)
  } catch (error) {
    logger.error('get file info failed', error)
    return res.status(404).send('Not Found')
  }
}