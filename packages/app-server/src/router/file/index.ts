/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-19 16:27:48
 * @Description: 
 */

import * as express from 'express'
import * as path from 'path'
import * as multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { handleUploadFile } from './upload'
import { handleDownloadFile } from './download'

/**
 * Creates the multer uploader
 */
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, uuidv4() + ext)
    }
  })
})

/**
 * The file router
 */
export const FileRouter = express.Router()

/**
 * Upload file
 * @see handleUploadFile()
 */
FileRouter.post('/upload/:bucket', uploader.single('file'), handleUploadFile)


/**
 * Download file
 * @see handleDownloadFile()
 */
FileRouter.get('/download/:bucket/:filename', handleDownloadFile)


/**
 * Alias URL for downloading file
 * @see handleDownloadFile()
 */
FileRouter.get('/:bucket/:filename', handleDownloadFile)