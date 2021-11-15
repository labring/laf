/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-11 18:07:36
 * @LastEditTime: 2021-11-13 16:23:58
 * @Description:
 */

import assert = require("assert")
import { parseToken } from "../../lib/utils"
import * as crypto from "crypto"
import { BucketType, FileItemType } from "../../lib/types"
import { Constants } from "../../constants"
import path = require("path/posix")

/**
 * file operations
 */
export enum FS_OPERATION {
  READ = 'r',
  WRITE = 'w',
  DELETE = 'd',
  LIST = 'l'
}

/**
 * check file operation token, the payload of the file token would have these fields:
 * ```
 * {
 *    ns: string,   // bucket name: indicated that this token only valid for this bucket
 *    op: string,   // operation permissions granted, values can be combined of values: 'r' | 'w' | 'd' | 'l'
 *    fn?: string   // optionally, filename
 * }
 * ```
 * @param bucket the bucket object
 * @param token the file operation token
 * @param operation the operation: 'create' | 'read' | 'delete' | 'list'
 * @param filename the name of file, optionally
 * @returns
 */
export function checkFileOperationToken(bucket: BucketType, token: string, operation: FS_OPERATION, filename?: string): [number, string] {
  assert(bucket, "empty `bucket` got")
  assert(operation, "empty `operation` got")

  if (!token) {
    return [401, "Unauthorized"]
  }

  const payload = parseToken(token, bucket.secret)
  if (!payload) {
    return [403, "invalid upload token"]
  }

  const granted = payload.op as string
  if (!granted.includes(operation)) {
    return [403, "permission denied"]
  }

  if (payload.ns != bucket.name) {
    return [403, "permission denied"]
  }

  if (filename && payload?.fn && payload.fn != filename) {
    return [403, "permission denied"]
  }

  return [0, null]
}

/**
 * generate http ETag of a file
 * @param file_size the size of file in bytes
 * @param update_date the update date time of file
 * @param filename file name
 */
export function generateETag(file_size: number, update_date: string, filename: string) {
  return crypto
    .createHash("md5")
    .update(`${filename}#${file_size}#${update_date}`)
    .digest("hex")
}

/**
 * Check if given file item is directory
 * @param file 
 * @returns 
 */
export function isDirectory(file: FileItemType) {
  return file.metadata.contentType === Constants.DIRECTORY_MIME_TYPE
}

/**
 * Resolve path, ex: trim '/' in the ends of filepath
 * @param filepath 
 * @returns 
 */
export function resolvePath(filepath: string) {
  if (!filepath) return '/'
  return path.resolve(filepath)
}