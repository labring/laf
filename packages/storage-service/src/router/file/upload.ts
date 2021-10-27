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
  const parent = req.query?.parent as string || "/"
  const bucket_name = req.params.bucket as string
  const token = req.query?.token as string

  // check given params
  if (!req.file) {
    return res.status(422).send("file or bucket name cannot be empty")
  }

  // check if bucket exists
  const bucket = await getBucketByName(bucket_name)
  if (!bucket) {
    return res.status(400).send('bucket not found')
  }

  // check file permissions
  const filename = path.join(parent, req.file.originalname)
  if (bucket.mode !== BucketMode.PUBLIC_READ_WRITE) {
    const [code, message] = checkFileOperationToken(bucket, token, FS_OPERATION.WRITE, filename)
    if (code) {
      return res.status(code).send(message)
    }
  }

  // check if directory exist
  if (false === await pathExists(bucket_name, parent)) {
    return res.status(400).send("file's directory doesn't exist")
  }

  // check if file already exist
  if (await pathExists(bucket_name, filename)) {
    return res.status(400).send("file already exists")
  }

  // construct file metadata
  const metadata: FileItemMeta = {
    contentType: req.file.mimetype,
    parent,
    name: req.file.originalname,
  }

  // start save
  const storage = new GridFSStorage(bucket_name, DatabaseAgent.db)
  const data = await storage.save(req.file.path, filename, metadata)
  return res.status(200).send({ code: 0, data })
}
