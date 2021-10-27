/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-18 23:43:17
 * @LastEditTime: 2021-10-27 15:19:56
 * @Description:
 */

import * as fs from "fs"
import * as assert from "assert"
import * as fsp from "fs/promises"
// import * as path from "path"

import { Db, GridFSBucket } from "mongodb"
import { resolveMIMEType } from "./utils"
import { FileItemMeta, FileItemType } from "./types"

export class GridFSStorage {
  readonly type = "gridfs"
  readonly bucket: string

  /**
   * The connected mongodb db instance
   */
  readonly db: Db

  constructor(bucket: string = "public", db: Db) {
    this.bucket = bucket
    this.db = db
  }

  /**
   * save a file into mongo gridfs system
   * @param file_path file path to create read stream
   * @param filename file name
   * @param metadata metadata information to save into database
   * @returns FileInfo Object
   */
  async save(file_path: string, filename: string, metadata: FileItemMeta): Promise<FileItemType> {
    assert(file_path, `error: filePath is empty`)
    assert(filename, `error: filename is empty`)

    const stats = await fsp.stat(file_path)
    assert(stats.isFile(), `${file_path} is not a file`)

    metadata.contentType = metadata?.contentType || resolveMIMEType(filename)

    // create a gridfs bucket
    const bucket = new GridFSBucket(this.db, { bucketName: this.bucket })

    const stream = bucket.openUploadStream(filename, { metadata })

    // save to gridfs
    await new Promise((resolve, reject) => {
      fs.createReadStream(file_path)
        .pipe(stream as any)
        .on("finish", resolve)
        .on("error", reject)
    })

    return this.info(filename)
  }

  async info(filename: string): Promise<FileItemType> {
    assert(filename, "error: empty filename got")

    // create a gridfs bucket
    const bucket = new GridFSBucket(this.db, { bucketName: this.bucket })

    // check if file exists
    const files = await bucket.find({ filename: filename }).toArray()
    const file = files.shift()
    if (!file) {
      return null
    }

    const info: FileItemType = {
      _id: file._id,
      filename: file.filename,
      length: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata as FileItemMeta
    }
    return info
  }

  async delete(filename: string): Promise<boolean> {
    assert(filename, "error: empty filename got")

    // create a gridfs bucket
    const bucket = new GridFSBucket(this.db, { bucketName: this.bucket })

    // check if file exists
    const files = await bucket.find({ filename: filename }).toArray()
    const file = files.shift()
    if (!file) {
      return false
    }

    await bucket.delete(file._id)
    return true
  }

  async read(filename: string): Promise<Buffer> {
    assert(filename, "error: empty filename got")

    const stream = this.createReadStream(filename)
    const buf: Buffer = await new Promise((resolve, reject) => {
      const buffers = []
      stream.on("data", (data) => buffers.push(data))
      stream.on("error", reject)
      stream.on("end", () => resolve(Buffer.concat(buffers)))
    })

    return buf
  }

  createReadStream(filename: string): fs.ReadStream {
    assert(filename, "error: empty filename got")

    // create a gridfs bucket
    const bucket = new GridFSBucket(this.db, { bucketName: this.bucket })
    return bucket.openDownloadStreamByName(filename) as any
  }
}
