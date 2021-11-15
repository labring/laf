import * as express from "express"
import { mkdir, pathExists } from "../../api/file"
import { getBucketByName } from "../../api/bucket"
import { BucketMode } from "../../lib/types"
import path = require("path")
import { checkFileOperationToken, FS_OPERATION, resolvePath } from "./utils"

/**
 * create an directory in an specified bucket
 * @param {string} bucket given bucket name which to insert
 * @query {string} name file's name
 * @query {string} dirname directory's dir name
 * @returns inserted dir doc
 */
export async function handleMakeDir(req: express.Request, res: express.Response) {
  const bucket_name = req.params.bucket as string
  const parent = resolvePath(req.query?.parent as string)
  const name = req.query?.name as string
  const token = req.query?.token as string

  // check give params
  if (!bucket_name || !name) {
    return res.status(400).send("missing params")
  }

  // check if bucket exists
  const bucket = await getBucketByName(bucket_name)
  if (!bucket) {
    return res.status(400).send('bucket not found')
  }

  // check file permissions
  const filename = path.join(parent, name)
  if (bucket.mode !== BucketMode.PUBLIC_READ_WRITE) {
    const [code, message] = checkFileOperationToken(bucket, token, FS_OPERATION.WRITE, filename)
    if (code) {
      return res.status(code).send(message)
    }
  }

  // check if parent directory exists
  if (false === await pathExists(bucket_name, parent)) {
    return res.status(400).send("parent directory doesn't exist")
  }

  // check if directory to be created exists
  if (await pathExists(bucket_name, filename)) {
    return res.send({ code: 'ALREADY_EXISTED', error: 'directory already existed' })
  }

  // construct directory document
  const insertedId = await mkdir(bucket_name, parent, name)
  return res.status(200).send({ code: 0, data: insertedId.toHexString() })
}
