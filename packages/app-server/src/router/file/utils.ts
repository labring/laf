import assert = require("assert")
import { parseToken } from "../../lib/utils/token"
import * as crypto from 'crypto'

/**
 * file operations
 */
export enum FS_OPERATION {
  /**
   * upload a file
   */
  CREATE = 'create',

  /**
   * read a file
   */
  READ = 'read',

  /**
   * delete a file
   */
  DELETE = 'delete',

  /**
   * read file list
   */
  LIST = 'list'
}

/**
 * check file operation token, the payload of the file token would have these fields:
 * ```
 * {
 *    bucket: string, // indicated that this token only valid for this `bucket`
 *    ops: string[],  // operation permissions granted, values can be one or more of: 'create' | 'read' | 'delete' | 'list'
 *    
 * }
 * ```
 * @param bucket the bucket name
 * @param token the file operation token
 * @param operation the operation: 'create' | 'read' | 'delete' | 'list'
 * @returns 
 */
export function checkFileOperationToken(bucket: string, token: string, operation: FS_OPERATION): [number, string] {
  assert(bucket, 'empty `bucket` got')
  assert(token, 'empty `token` got')
  assert(operation, 'empty `operation` got')

  if (!token) {
    return [401, 'Unauthorized']
  }

  const payload = parseToken(token)
  if (!payload) {
    return [403, 'invalid upload token']
  }

  const operations = payload.ops ?? []
  if (!operations.includes(operation)) {
    return [403, 'permission denied']
  }

  if (payload?.bucket != bucket) {
    return [403, 'permission denied']
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
  return crypto.createHash('md5').update(`${filename}#${file_size}#${update_date}`).digest('hex')
}