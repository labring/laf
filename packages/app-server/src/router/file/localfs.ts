/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-11 18:01:25
 * @LastEditTime: 2021-08-19 00:19:42
 * @Description: 
 */
import { logger } from '../../lib/logger'
import * as express from 'express'
import * as path from 'path'
import Config from '../../config'
import { LocalFSStorage } from '../../lib/storage/localfs-storage'
import { checkFileOperationToken, FS_OPERATION } from './utils'


export const LocalFileSystemHandlers = {
  handleUploadFile,
  handleDownloadFile
}

/**
 * Upload file into the local file system
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 */
async function handleUploadFile(req: express.Request, res: express.Response) {

  const bucket = req.params.bucket
  if (!LocalFSStorage.checkDirectoryName(bucket)) {
    return res.status(422).send('invalid bucket name')
  }

  // check file operation token if bucket is not 'public'
  if (bucket !== 'public') {
    const [code, message] = checkFileOperationToken(bucket, req.query?.token as string, FS_OPERATION.CREATE)
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
  const localStorage = new LocalFSStorage(Config.LOCAL_STORAGE_ROOT_PATH, bucket)
  const filepath = path.join(file.destination, `${file.filename}`)
  const info = await localStorage.save(filepath, file.filename)

  // do not expose server path to client
  delete info.fullpath

  return res.send({
    code: 0,
    data: info
  })
}


/**
 * Download file from the local file system by pointed bucket name and filename
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 */
async function handleDownloadFile(req: express.Request, res: express.Response) {

  const { bucket, filename } = req.params
  if (!LocalFSStorage.checkDirectoryName(bucket)) {
    return res.status(422).send('invalid bucket')
  }

  if (!LocalFSStorage.checkFilename(filename)) {
    return res.status(422).send('invalid filename')
  }

  // check file operation token if bucket is not 'public'
  if (bucket !== 'public') {
    const [code, message] = checkFileOperationToken(bucket, req.query?.token as string, FS_OPERATION.READ, filename)
    if (code) {
      return res.status(code).send(message)
    }
  }

  const localStorage = new LocalFSStorage(Config.LOCAL_STORAGE_ROOT_PATH, bucket)

  try {
    const info = await localStorage.info(filename)
    return res.download(info.fullpath)
  } catch (error) {
    logger.error('get file info failed', error)
    return res.status(404).send('Not Found')
  }
}