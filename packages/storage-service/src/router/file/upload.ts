import * as express from "express"
import { GridFSStorage } from "../../lib/gridfs-storage"
import { DatabaseAgent } from "../../lib/database"
import { mkdir } from "../../lib/mkdir"
import path = require("path/posix")

/**
 * upload a file into a specified bucket
 * @param {string} bucket bucket name
 * @param {string} dirname file's directory name
 * @param file uploaded file
 * @returns doc uploaded file doc
 */
export async function handleUploadFile(
  req: express.Request,
  res: express.Response
) {
  const dirname = req.query?.dirname || "/"
  const bucket = req.params.bucket
  // check given params
  if (!req.file || !bucket) {
    return res.status(422).send("file or bucket name cannot be empty")
  }
  const coll = DatabaseAgent.db.collection((bucket as string) + ".files")
  // check if directory exist
  const d = await coll.countDocuments({ filename: dirname })
  if (d === 0) {
    return res.status(400).send("file's direcotry doesn't exist")
  }
  // check if file already exist
  const filename = path.join(dirname as string, req.file.originalname)
  const f = await coll.findOne({ filename })
  if (f) {
    return res.status(400).send("file already exists")
  }
  // construct file metadata
  const metadata = {
    type: "file",
    contentType: req.file.mimetype,
    dirname,
    filename: req.file.originalname,
  }
  // start save
  const storage = new GridFSStorage(bucket as string, DatabaseAgent.db)
  const data = await storage.save(req.file.path, filename, metadata)
  return res.status(200).send({ code: 0, data })
}

/**
 * create an directory in an specified bucket
 * @param {string} bucket given bucket name which to insert
 * @param {string} filename directory's name
 * @param {string} dirname directory's dir name
 * @returns inserted dir doc
 */
export async function handleMakeDir(
  req: express.Request,
  res: express.Response
) {
  const bucket: string = req.params.bucket
  const dirname = req.query?.dirname || "/"
  const filename = req.query?.name
  // check give params
  if (!bucket || !dirname || !filename) {
    return res.status(400).send("missing params")
  }
  // check if parent directory exists
  const coll = DatabaseAgent.db.collection(bucket + ".files")
  const f = await coll.findOne({ filename: dirname })
  if (!f) {
    return res.status(400).send("parent directory doesn't exist")
  }
  // construct directory document
  const r = await mkdir(bucket, dirname as string, filename as string)
  return res.status(200).send({ code: 0, data: r })
}
