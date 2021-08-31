
import { assert } from '@/utils/assert'
import request from '@/utils/request'

/**
 * Get bucket list
 * @returns
 */
export async function getFileBuckets() {
  const res = await request({
    url: `/file/buckets`,
    method: 'get'
  })

  assert(res.code === 0, 'get file buckets got error', res)
  return res
}

/**
 * Create a bucket
 * @param {string} bucketName
 * @returns {Promise<any[]>}
 */
export async function createFileBucket(bucketName) {
  const res = await request({
    url: `/file/buckets`,
    method: 'post',
    data: {
      bucket: bucketName
    }
  })

  return res
}

/**
 * Delete a bucket
 * @param {string} bucketName
 * @returns
 */
export async function deleteFileBucket(bucketName) {
  const res = await request({
    url: `/file/buckets/${bucketName}`,
    method: 'delete'
  })

  return res
}

/**
 * Get file list in a bucket
 * @param {string} bucketName
 * @returns
 */
export async function getFilesByBucketName(bucketName, { offset, limit, keyword }) {
  assert(bucketName, 'empty `bucketName` got')
  const _offset = offset || 0
  const _limit = limit || 10
  let query = `offset=${_offset}&limit=${_limit}`
  if (keyword) {
    query = query + `&keyword=${keyword}`
  }

  const res = await request({
    url: `/file/${bucketName}/files?${query}`,
    method: 'GET'
  })
  assert(res.code === 0, `get files in ${bucketName} got error`, res)
  return res
}

/**
 * Delete a file by its id in a bucket
 * @param {string} bucketName
 * @param {string} file_id
 * @returns
 */
export async function deleteFileById(bucketName, file_id) {
  assert(bucketName, 'empty bucketName got')
  assert(file_id, 'empty file_id got')

  const res = await request({
    url: `/file/${bucketName}/${file_id}`,
    method: 'DELETE'
  })

  return res
}
