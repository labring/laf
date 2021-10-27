/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-10-27 16:10:27
 * @LastEditTime: 2021-10-27 18:15:23
 * @Description:
 */

import * as express from "express"
import { checkFileOperationToken, FS_OPERATION, isDirectory, resolvePath } from "./utils"
import { logger } from "../../lib/logger"
import { getBucketByName } from "../../api/bucket"
import { countFilesInDirectory, deleteDirectory, deleteFile, getFileByName } from "../../api/file"

/**
 * Downloads file by bucket name and filename
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 * @param {string} file_path file path
 */
export async function handleDeleteFile(req: express.Request, res: express.Response) {
  const bucket_name = req.params?.bucket as string
  const token = req.query?.token as string
  const filename = resolvePath(req.query?.path as string)

  // check if bucket exists
  const bucket = await getBucketByName(bucket_name)
  if (!bucket) {
    return res.status(404).send('bucket not found')
  }

  // check file permissions
  const [code, message] = checkFileOperationToken(bucket, token, FS_OPERATION.DELETE, filename)
  if (code) {
    return res.status(code).send(message)
  }

  // reject if root path given
  if (filename === '/') {
    return res.status(400).send('cannot delete root path')
  }

  try {
    // check if file exists
    const file = await getFileByName(bucket_name, filename)
    if (!file) {
      return res.status(404).send("file not exist")
    }

    // check if directory
    if (isDirectory(file)) {
      const fileCount = await countFilesInDirectory(bucket_name, filename)
      if (fileCount > 0) {
        return res.send({
          code: 'DIRECTORY_NOT_EMPTY',
          error: 'cannot delete none-empty-directory'
        })
      }

      const r = await deleteDirectory(bucket_name, filename)
      return res.send({ code: 0, data: r })
    }

    const r = await deleteFile(bucket_name, filename)
    return res.send({ code: 0, data: r })

  } catch (error) {
    logger.error("delete file failed", error)
    return res.status(500).send("Internal Server Error")
  }
}
