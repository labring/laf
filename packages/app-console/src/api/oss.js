
import store from '@/store'
import { assert } from '@/utils/assert'
import request from '@/utils/request'

/**
 * Get bucket list
 * @returns
 */
export async function getBuckets() {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/oss/buckets`,
    method: 'get'
  })

  assert(res.code === 0, 'get file buckets got error', res)
  return res
}

/**
 * Get a bucket & tokens
 * @returns
 */
export async function getBucket(bucketName) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/oss/buckets/${bucketName}`,
    method: 'get'
  })

  assert(res.code === 0, 'get bucket got error', res)
  return res
}

/**
 * Create a bucket
 * @param {string} bucketName
 * @param {number} mode
 * @returns {Promise<any[]>}
 */
export async function createBucket(bucketName, mode) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/oss/buckets`,
    method: 'post',
    data: {
      bucket: bucketName,
      mode
    }
  })

  assert(res.code === 0, 'create bucket got error', res)
  return res
}

/**
 * Update a bucket
 * @param {string} bucketName
 * @param {number} mode
 * @returns {Promise<any[]>}
 */
export async function updateBucket(bucketName, mode) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/oss/buckets/${bucketName}`,
    method: 'put',
    data: {
      mode
    }
  })

  assert(res.code === 0, 'update bucket got error', res)
  return res
}

/**
 * Delete a bucket
 * @param {string} bucketName
 * @returns
 */
export async function deleteBucket(bucketName) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/oss/buckets/${bucketName}`,
    method: 'delete'
  })

  assert(res.code === 0, 'delete bucket got error', res)
  return res
}

/**
 * get bucket's url
 * @param {*} bucket
 * @returns
 */
 export function getBucketUrl(bucket) {
  const appid = store.state.app.appid
  const endpoint = store.state.app.oss_external_endpoint
  const url = `${endpoint}/${appid}-${bucket}`
  return url
}