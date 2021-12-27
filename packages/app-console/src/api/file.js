
import store from '@/store'
import { assert } from '@/utils/assert'
import request from '@/utils/request'

/**
 * Get bucket list
 * @returns
 */
export async function getFileBuckets() {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/file/buckets`,
    method: 'get'
  })

  assert(res.code === 0, 'get file buckets got error', res)
  return res
}

/**
 * Get a bucket & tokens
 * @returns
 */
export async function getOneBucket(bucketName) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/file/buckets/${bucketName}`,
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
export async function createFileBucket(bucketName, mode) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/file/buckets`,
    method: 'post',
    data: {
      bucket: bucketName,
      mode
    }
  })

  return res
}

/**
 * Update a bucket
 * @param {string} bucketName
 * @param {number} mode
 * @returns {Promise<any[]>}
 */
export async function updateFileBucket(bucketName, mode) {
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/file/buckets/${bucketName}`,
    method: 'put',
    data: {
      mode
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
  const appid = store.state.app.appid
  const res = await request({
    url: `/apps/${appid}/file/buckets/${bucketName}`,
    method: 'delete'
  })

  return res
}

/**
 * Get file list in a bucket
 * @param {string} bucketName
 * @returns
 */
export async function getFilesByBucketName(bucketName, { offset, limit, path, token }) {
  assert(bucketName, 'empty `bucketName` got')

  const file_url = getAppFileUrl(bucketName, path)
  let query = `offset=${offset}&limit=${limit}`
  if (token) {
    query = query + `&token=${token}`
  }

  const res = await request({
    url: `${file_url}?${query}`,
    method: 'GET'
  })

  return res
}

/**
 * Make directory in bucket
 * @param {string} bucketName
 * @param {string} name the directory name to create
 * @param {string} parent
 * @param {string} token
 * @returns
 */
export async function makeDirectory(bucketName, name, parent = '/', token) {
  assert(bucketName, 'empty `bucketName` got')
  assert(name, 'empty `name` got')

  const bucket_url = getAppFileBucketUrl(bucketName)
  let query = `parent=${parent}&name=${name}`
  if (token) {
    query = query + `&token=${token}`
  }
  const res = await request({
    url: `${bucket_url}/dir?${query}`,
    method: 'post'
  })

  return res
}

/**
 * Delete a file/directory in a bucket
 * @param {string} bucketName
 * @param {string} path
 * @returns
 */
export async function deleteFile(bucketName, path, token) {
  assert(bucketName, 'empty bucketName got')
  assert(path, 'empty file_id got')

  let query = ``
  if (token) {
    query = `?token=${token}`
  }
  const file_url = getAppFileUrl(bucketName, path)
  const res = await request({
    url: `${file_url}${query}`,
    method: 'DELETE'
  })

  return res
}

/**
 * 获取当前应用的指定文件桶的服务地址
 * @param {*} bucket
 * @returns
 */
export function getAppFileBucketUrl(bucket) {
  const appid = store.state.app.appid
  const domain = store.state.app.storage_deploy_host
  const schema = store.state.app.storage_deploy_url_schema || 'http'
  const url = `${schema}://${appid}_${bucket}.${domain}`
  return url
}

/**
 * 获取当前应该的文件地址
 * @param {*} bucket
 * @param {*} path
 * @param {*} token
 * @returns
 */
export function getAppFileUrl(bucket, path, token) {
  let file_url = getAppFileBucketUrl(bucket)
  if (path) {
    file_url += path
  }
  let query = ``
  // if (path) {
  //   query += `path=${path}`
  // }

  if (token) {
    query = `?token=${token}`
  }

  return `${file_url}${query}`
}
