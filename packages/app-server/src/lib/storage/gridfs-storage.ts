/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-18 23:43:17
 * @LastEditTime: 2021-08-19 01:37:08
 * @Description:
 */

import * as fs from "fs"
import * as assert from 'assert'
import * as fsp from "fs/promises"
import * as path from 'path'

import { Db, GridFSBucket } from "mongodb"
import { FileInfo, FileStorageInterface } from "./interface"


export class GridFSStorage implements FileStorageInterface {
  readonly type = 'gridfs'
  readonly bucket: string

  /**
   * The connected mongodb db instance
   */
  readonly db: Db

  constructor(bucket: string = 'public', db: Db) {
    this.bucket = bucket
    this.db = db
  }

  async save(file_path: string, filename: string, metadata?: any): Promise<FileInfo> {
    assert(file_path, `error: filePath is empty`)
    assert(filename, `error: filename is empty`)

    const stats = await fsp.stat(file_path)
    assert(stats.isFile(), `${file_path} is not a file`)

    // create a gridfs bucket
    const bucket = new GridFSBucket(this.db, { bucketName: this.bucket })

    const stream = bucket.openUploadStream(filename, {
      metadata: metadata ?? {},
      // @deprecated: this field will be deprecated in future, use metadata.contentType instead. keep it now for history reasons
      contentType: metadata?.contentType
    })

    // save to gridfs
    await new Promise((resolve, reject) => {
      fs.createReadStream(file_path)
        .pipe(stream as any)
        .on('finish', resolve)
        .on('error', reject)
    })

    const info: FileInfo = {
      id: stream.id.toHexString(),
      filename: stream.filename,
      bucket: this.bucket,
      contentType: metadata?.contentType,
      path: path.join('/', this.bucket, filename),
      size: stats.size,
      original_name: metadata?.originalname
    }
    return info
  }

  async info(filename: string): Promise<FileInfo> {
    assert(filename, 'error: empty filename got')

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
      contentType: file.metadata?.contentType,
      path: path.join('/', this.bucket, file.filename),
      size: file.length,
      original_name: file.metadata?.original_name,
      upload_date: file.uploadDate
    }
    return info
  }

  async delete(filename: string): Promise<boolean> {
    assert(filename, 'error: empty filename got')

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
    assert(filename, 'error: empty filename got')

    const stream = this.createReadStream(filename)
    const buf: Buffer = await new Promise((resolve, reject) => {
      const buffers = []
      stream.on('data', data => buffers.push(data))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(buffers)))
    })

    return buf
  }

  createReadStream(filename: string): fs.ReadStream {
    assert(filename, 'error: empty filename got')

    // create a gridfs bucket
    const bucket = new GridFSBucket(this.db, { bucketName: this.bucket })
    return bucket.openDownloadStreamByName(filename) as any
  }
}
