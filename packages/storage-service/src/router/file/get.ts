/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-19 16:10:27
 * @LastEditTime: 2022-02-02 18:56:09
 * @Description:
 */

import * as express from "express"
import { checkFileOperationToken, FS_OPERATION, generateETag, isDirectory, resolvePath } from "./utils"
import Config from "../../config"
import { logger } from "../../lib/logger"
import { GridFSStorage } from "../../lib/gridfs-storage"
import { DatabaseAgent } from "../../lib/database"
import { BucketMode } from "../../lib/types"
import { getBucketByName } from "../../api/bucket"
import { countFilesInDirectory, getFileByName, getFilesInDirectory } from "../../api/file"

/**
 * Downloads file by bucket name and filename
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 * @param {string} file_path file path
 */
export async function handleGetFile(req: express.Request, res: express.Response) {
  const bucket_name = req.params?.bucket as string
  const token = req.query?.token as string
  const filename = resolvePath(req.query?.path as string)

  // check if bucket exists
  const bucket = await getBucketByName(bucket_name)
  if (!bucket) {
    return res.status(404).send('bucket not found')
  }

  // check file permissions
  if (bucket.mode === BucketMode.PRIVATE) {
    const [code, message] = checkFileOperationToken(bucket, token, FS_OPERATION.READ, filename)
    if (code) {
      return res.status(code).send(message)
    }
  }

  // check if file exists
  const file = await getFileByName(bucket_name, filename)
  if (!file) {
    return res.status(404).send("file not exist")
  }

  // check if directory
  if (isDirectory(file)) {
    const [code, message] = checkFileOperationToken(bucket, token, FS_OPERATION.LIST, filename)
    if (code) {
      return res.status(code).send(message)
    }

    const offset = Number(req.query?.offset ?? 0) as any
    const limit = Number(req.query?.limit) as any

    const files = await getFilesInDirectory(bucket_name, filename, offset, limit)
    const total = await countFilesInDirectory(bucket_name, filename)
    res.type('json')
    return res.status(200).send({ type: 'directory', data: files, total })
  }

  try {
    const storage = new GridFSStorage(bucket_name, DatabaseAgent.db)
    const stream = storage.createReadStream(filename as string)

    // set content type in response header
    if (file.metadata.contentType) {
      res.contentType(file.metadata.contentType)
    }

    // process cache policy with `Cache-Control` andy `Last-Modified`
    if (Config.FILE_SYSTEM_HTTP_CACHE_CONTROL) {
      res.set("Cache-Control", Config.FILE_SYSTEM_HTTP_CACHE_CONTROL)
    }

    if (file?.uploadDate) {
      res.set("Last-Modified", file.uploadDate.toUTCString())
    }

    // process cache policy with `ETag` & `If-None-Match`
    const etag = generateETag(
      file.length,
      file.uploadDate.toString(),
      file.filename
    )
    res.set("ETag", etag)
    if (req.header("If-None-Match") === etag) {
      res.status(304).send("Not Modified")
      return
    }

    // process partly request
    res.set('Accept-Ranges', 'bytes')

    res.set("x-bucket", bucket_name)
    res.set("x-uri", encodeURI(filename))
    res.set('Content-Length', `${file.length}`)
    return stream.pipe(res)
  } catch (error) {
    logger.error("get file failed", error)
    return res.status(500).send("Internal Server Error")
  }
}
