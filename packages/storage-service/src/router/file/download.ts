/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-19 16:10:27
 * @LastEditTime: 2021-08-19 17:04:29
 * @Description:
 */

import * as express from "express"
import { generateETag } from "./utils"
import Config from "../../config"
import { logger } from "../../lib/logger"
import { GridFSStorage } from "../../lib/gridfs-storage"
import { DatabaseAgent } from "../../lib/database"

/**
 * Downloads file by bucket name and filename
 * @param {string} bucket the bucket of file to store into, for example if `bucket = public`, the file path would be `/public/xxx.png`
 * @param {string} file_path file path
 */
export async function handleGetFile(
  req: express.Request,
  res: express.Response
) {
  const bucket = req.params?.bucket
  const filename = (req.query?.path as string) || "/"
  console.log(filename)
  // @todo
  // check file operation token if bucket is not 'public'
  const coll = DatabaseAgent.db.collection((bucket as string) + ".files")
  console.log((bucket as string) + ".files")

  // check if file exists
  const file = await coll.findOne({ filename })
  if (!file) {
    return res.status(404).send("file not exist")
  }

  // check if directory
  if (file.metadata.type === "dir") {
    const files = await coll.find({ "metadata.dirname": filename }).toArray()
    return res.status(200).send({ code: 0, data: files })
  }
  try {
    const storage = new GridFSStorage(bucket, DatabaseAgent.db)
    const stream = storage.createReadStream(filename as string)

    // set content type in response header
    if (file.metadata.contentType) {
      res.contentType(file.contentType)
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
      file.size,
      file.uploadDate.toString(),
      file.filename
    )
    res.set("ETag", etag)
    if (req.header("If-None-Match") === etag) {
      res.status(304).send("Not Modified")
      return
    }

    res.set("x-bucket", bucket)
    res.set("x-uri", filename)
    return stream.pipe(res)
  } catch (error) {
    logger.error("get file info failed", error)
    return res.status(500).send("Internal Server Error")
  }
}
