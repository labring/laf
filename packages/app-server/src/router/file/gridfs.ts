
import * as fs from 'fs'
import * as express from 'express'
import { GridFSBucket } from 'mongodb'
import { DatabaseAgent } from '../../lib/database'
import { checkFileOperationToken, FS_OPERATION, generateETag } from './utils'
import Config from '../../config'
import { logger } from '../../lib/logger'


export const GridFSHandlers = {
  handleUploadFile,
  handleDownloadFile
}

/**
 * upload file to the gridfs
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 */
async function handleUploadFile(req: express.Request, res: express.Response) {
  const auth = req['auth']
  const bucket_name = req.params.bucket

  // check file operation token if bucket is not 'public'
  if (bucket_name !== 'public') {
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

  // create a local file system driver
  const bucket = new GridFSBucket(DatabaseAgent.accessor.db, { bucketName: bucket_name })

  const stream = bucket.openUploadStream(file.filename, {
    metadata: {
      original_name: file.originalname,
      created_by: auth?.uid,
      bucket: bucket_name,
      created_at: Date.now(),
      contentType: file.mimetype
    },
    // @deprecated: this field will be deprecated in future, use metadata instead. keep it now for history reasons
    contentType: file.mimetype
  })


  // save to gridfs
  fs.createReadStream(file.path)
    .pipe(stream as any)
    .on('finish', () => {
      res.send({
        code: 0,
        data: {
          id: stream.id,
          filename: stream.filename,
          bucket: bucket_name,
          contentType: file.mimetype
        }
      })
    })
    .on('error', (err: Error) => {
      logger.error('upload file to gridfs stream occurred error', err)
      res.status(500).send('internal server error')
    })
}


/**
 * download file from gridfs by pointed bucket name and filename
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 */
async function handleDownloadFile(req: express.Request, res: express.Response) {

  const { bucket: bucket_name, filename } = req.params

  // check file operation token if bucket is not 'public'
  if (bucket_name !== 'public') {
    const [code, message] = checkFileOperationToken(bucket_name, req.query?.token as string, FS_OPERATION.READ)
    if (code) {
      return res.status(code).send(message)
    }
  }


  try {

    const bucket = new GridFSBucket(DatabaseAgent.accessor.db, { bucketName: bucket_name })
    const stream = bucket.openDownloadStreamByName(filename)

    const files = await bucket.find({ filename: filename }).toArray()
    const file = files.shift()
    if (!file) {
      return res.status(404).send('Not Found')
    }

    const contentType = file?.metadata?.contentType || file?.contentType
    if (contentType) {
      res.contentType(contentType)
    }

    if (Config.FILE_SYSTEM_HTTP_CACHE_CONTROL) {
      res.set('Cache-Control', Config.FILE_SYSTEM_HTTP_CACHE_CONTROL)
    }
    res.set('Last-Modified', file.uploadDate.toUTCString())

    // process cache policy with ETag & If-None-Match
    const ETag = generateETag(file.length, file.uploadDate.toString(), file.filename)
    res.set('ETag', ETag)
    if (req.header('If-None-Match') === ETag) {
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