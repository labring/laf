
import * as fs from 'fs'
import * as express from 'express'
import { GridFSBucket } from 'mongodb'
import { Globals } from '../../lib/globals'
import { checkFileOperationToken, FS_OPERATION } from './utils'


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
  const bucket = new GridFSBucket(Globals.accessor.db, { bucketName: bucket_name })

  const stream = bucket.openUploadStream(file.filename, {
    metadata: { original_name: file.originalname, created_by: auth?.uid, bucket: bucket_name, created_at: Date.now() },
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
      Globals.logger.error('upload file to gridfs stream occurred error', err)
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

    const bucket = new GridFSBucket(Globals.accessor.db, { bucketName: bucket_name })
    const stream = bucket.openDownloadStreamByName(filename)

    const files = await bucket.find({ filename: filename }).toArray()
    const file = files.shift()
    if (!file) {
      return res.status(404).send('Not Found')
    }

    if (file?.contentType) {
      res.contentType(file.contentType)
    }

    res.set('x-bucket', bucket_name)
    res.set('x-uri', `/${bucket_name}/${filename}`)
    return stream.pipe(res)
  } catch (error) {
    Globals.logger.error('get file info failed', error)
    return res.status(404).send('Not Found')
  }
}