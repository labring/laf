/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-18 23:43:17
 * @LastEditTime: 2021-08-19 16:57:54
 * @Description:
 */

import * as fs from "fs"
import * as assert from "assert"
import * as fsp from "fs/promises"
// import * as path from "path"

import { Db, GridFSBucket } from "mongodb"
import { resolveMIMEType } from "./utils"

export interface FileInfo {
  /**
   * The file id, only valid for `gridfs`
   */
  id?: string

  /**
   * The file name
   */
  filename: string

  /**
   * The size of file in bytes
   */
  size: number

  /**
   * The bucket name of file
   */
  bucket: string

  /**
   * The content type of file, only valid for `gridfs`
   */
  contentType?: string

  /**
   * The uploaded date time of file
   */
  upload_date?: Date
}

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
  async save(
    file_path: string,
    filename: string,
    metadata?: any
  ): Promise<FileInfo> {
    assert(file_path, `error: filePath is empty`)
    assert(filename, `error: filename is empty`)

    const stats = await fsp.stat(file_path)
    assert(stats.isFile(), `${file_path} is not a file`)

    metadata = metadata ?? {}
    metadata.contentType = metadata?.contentType || resolveMIMEType(filename)

    // create a gridfs bucket
    const bucket = new GridFSBucket(this.db, { bucketName: this.bucket })

    const stream = bucket.openUploadStream(filename, {
      metadata: metadata,
      // @deprecated: this field will be deprecated in future, use metadata.contentType instead. keep it now for history reasons
      contentType: metadata?.contentType,
    })

    // save to gridfs
    await new Promise((resolve, reject) => {
      fs.createReadStream(file_path)
        .pipe(stream as any)
        .on("finish", resolve)
        .on("error", reject)
    })

    const info: FileInfo = {
      id: stream.id.toHexString(),
      filename: stream.filename,
      bucket: this.bucket,
      contentType: metadata?.contentType ?? resolveMIMEType(stream.filename),
      size: stats.size,
    }
    return info
  }
  async info(filename: string): Promise<FileInfo> {
    assert(filename, "error: empty filename got")

    // create a gridfs bucket
    const bucket = new GridFSBucket(this.db, { bucketName: this.bucket })

    // check if file exists
    const files = await bucket.find({ filename: filename }).toArray()
    const file = files.shift()
    if (!file) {
      return null
    }

    const info: FileInfo = {
      id: file._id.toHexString(),
      filename: file.filename,
      bucket: this.bucket,
      contentType: file.metadata?.contentType ?? resolveMIMEType(file.filename),
      size: file.length,
      upload_date: file.uploadDate,
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
