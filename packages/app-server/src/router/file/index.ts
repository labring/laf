import * as express from 'express'
import * as path from 'path'
import * as multer from 'multer'
import Config from '../../config'
import { v4 as uuidv4 } from 'uuid'

import { LocalFileSystemHandlers } from './localfs'
import { GridFSHandlers } from './gridfs'

// config multer
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, uuidv4() + ext)
    }
  })
})

export const FileRouter = express.Router()


/**
 * if use GridFS driver
 */
if (Config.FILE_SYSTEM_DRIVER === "gridfs") {
  /**
   * upload file
   * @see GridFSHandlers.handleUploadFile()
   */
  FileRouter.post('/upload/:bucket', uploader.single('file'), GridFSHandlers.handleUploadFile)


  /**
   * download file
   * @see GridFSHandlers.handleDownloadFile()
   */
  FileRouter.get('/download/:bucket/:filename', GridFSHandlers.handleDownloadFile)

  /**
   * Alias URL for downloading file
   * @see GridFSHandlers.handleDownloadFile()
   */
  FileRouter.get('/:bucket/:filename', GridFSHandlers.handleDownloadFile)
}


/**
 * if use local file system driver
 */
if (Config.FILE_SYSTEM_DRIVER === "local") {
  // config multer
  const uploader = multer({
    storage: multer.diskStorage({
      filename: (_req, file, cb) => {
        const { ext } = path.parse(file.originalname)
        cb(null, uuidv4() + ext)
      }
    })
  })

  FileRouter.use('/public', express.static(path.join(Config.LOCAL_STORAGE_ROOT_PATH, 'public')))

  /**
   * upload file
   * @see LocalFileSystemHandlers.handleUploadFile()
   */
  FileRouter.post('/upload/:bucket', uploader.single('file'), LocalFileSystemHandlers.handleUploadFile)


  /**
   * download file
   * @see LocalFileSystemHandlers.handleDownloadFile()
   */
  FileRouter.get('/download/:bucket/:filename', LocalFileSystemHandlers.handleDownloadFile)

}
