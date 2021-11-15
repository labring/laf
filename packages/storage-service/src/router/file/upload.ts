import * as express from "express"
import { GridFSStorage } from "../../lib/gridfs-storage"
import { DatabaseAgent } from "../../lib/database"
import path = require("path")
import { getBucketByName } from "../../api/bucket"
import { pathExists } from "../../api/file"
import { BucketMode, FileItemMeta } from "../../lib/types"
import { checkFileOperationToken, FS_OPERATION } from "./utils"

/**
 * upload a file into a specified bucket
 * @param {string} bucket bucket name
 * @param {string} dirname file's directory name
 * @param file uploaded file
 * @returns doc uploaded file doc
 */
export async function handleUploadFile(req: express.Request, res: express.Response) {
  const parent = req.query?.path as string || "/"
  const bucket_name = req.params.bucket as string
  const token = req.query?.token as string
  const auto_name = Number(req.query?.auto ?? 0)

  // check given params
  if (!req.file) {
    return res.status(422).send("file or bucket name cannot be empty")
  }

  // check if bucket exists
  const bucket = await getBucketByName(bucket_name)
  if (!bucket) {
    return res.status(400).send('bucket not found')
  }

  const filename = auto_name ? req.file.filename : req.file.originalname

  // check file permissions
  const filename_full = path.join(parent, filename)
  if (bucket.mode !== BucketMode.PUBLIC_READ_WRITE) {
    const [code, message] = checkFileOperationToken(bucket, token, FS_OPERATION.WRITE, filename_full)
    if (code) {
      return res.status(code).send(message)
    }
  }

  // check if directory exist
  if (false === await pathExists(bucket_name, parent)) {
    return res.send({ code: 'NOT_FOUND', error: "file's directory doesn't exist" })
  }

  // check if file already exist
  if (await pathExists(bucket_name, filename_full)) {
    return res.send({ code: 'ALREADY_EXISTED', error: "file already exists" })
  }

  // construct file metadata
  const metadata: FileItemMeta = {
    contentType: req.file.mimetype,
    parent,
    name: filename,
  }

  // start save
  const storage = new GridFSStorage(bucket_name, DatabaseAgent.db)
  const data = await storage.save(req.file.path, filename_full, metadata)
  return res.send({ code: 0, data })
}
