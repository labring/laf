import * as AWS from 'aws-sdk'
import { useAppStore } from '~/store'
import { assert } from '~/utils/assert'
import request from '~/api/request'

const appStore = useAppStore()

/**
 * Get bucket list
 * @returns
 */
export async function getBuckets() {
  const appid = appStore.currentApp.appid
  const res: any = await request({
    url: `/sys-api/apps/${appid}/oss/buckets`,
    method: 'get',
  })

  assert(res.code === 0, 'get file buckets got error', res)
  return res
}

/**
 * Get a bucket & tokens
 * @returns
 */
export async function getOneBucket(bucketName: any): Promise<any> {
  const appid = appStore.currentApp.appid
  const res: any = await request({
    url: `/sys-api/apps/${appid}/oss/buckets/${bucketName}`,
    method: 'get',
  })

  return res
}

/**
 * Create a bucket
 * @param {string} bucketName
 * @param {number} mode
 * @returns {Promise<any[]>}
 */
export async function createBucket(bucketName: string, mode: string, quota: number) {
  const appid = appStore.currentApp.appid
  const res = await request({
    url: `/sys-api/apps/${appid}/oss/buckets`,
    method: 'post',
    data: {
      bucket: bucketName,
      mode,
      quota,
    },
  })

  return res
}

/**
 * Update a bucket
 * @param {string} bucketName
 * @param {number} mode
 * @returns {Promise<any[]>}
 */
export async function updateBucket(bucketName: string, mode: string, quota: number) {
  const appid = appStore.currentApp.appid
  const res: any = await request({
    url: `/sys-api/apps/${appid}/oss/buckets/${bucketName}`,
    method: 'put',
    data: {
      mode,
      quota,
    },
  })

  assert(res.code === 0, 'update bucket got error', res)
  return res
}

/**
 * Delete a bucket
 * @param {string} bucketName
 * @returns
 */
export async function deleteBucket(bucketName: any) {
  const appid = appStore.currentApp.appid
  const res: any = await request({
    url: `/sys-api/apps/${appid}/oss/buckets/${bucketName}`,
    method: 'delete',
  })

  assert(res.code === 0, 'delete bucket got error', res)
  return res
}

/**
 * get bucket's url
 * @param {*} bucket
 * @returns
 */
export function getBucketUrl(bucket: any) {
  const appid = appStore.currentApp.appid
  const endpoint = appStore.ossExternalEndpoint
  const url = `${endpoint}/${appid}-${bucket}`
  return url
}

/**
 * get bucket's secondary url e.g: appid-bucketName.oss.aliyun.com
 * @param {*} bucketName
 * @param {*} param1
 * @returns
 */
export function getBucketSecondaryUrl(bucketName: any) {
  const appid = appStore.currentApp.appid
  const endpoint = new URL(appStore.ossInternalEndpoint.toString())
  const { protocol, host } = endpoint
  const url = `${protocol}//${appid}-${bucketName}.${host}`
  return url
}

/**
 * Get file list in a bucket
 * @param {string} bucketName
 * @returns
 */
export async function getFilesByBucketName(bucketName: any, { marker, prefix, credentials }: any) {
  assert(bucketName, 'empty `bucketName` got')

  const bucket = getInternalBucketName(bucketName)
  const s3 = getS3Client(credentials)
  const res = await s3.listObjects({ Bucket: bucket, MaxKeys: 100, Marker: marker, Prefix: prefix, Delimiter: '/' }).promise()
  return res
}

/**
 * Get app file url
 * @param {*} bucket
 * @param {*} key
 * @param {*} token
 * @returns
 */
export function getAppFileUrl(bucketName: any, key: any, credentials: any) {
  const s3 = getS3Client(credentials)
  const bucket = getInternalBucketName(bucketName)

  const res = s3.getSignedUrl('getObject', { Bucket: bucket, Key: key })
  return res
}

/**
 * Upload file
 * @param {*} bucketName
 * @param {*} key
 * @param {*} body
 * @param {*} credentials
 * @returns
 */
export async function uploadAppFile(bucketName: any, key: any, body: any, credentials: any, { contentType }: any) {
  const s3 = getS3Client(credentials)
  const bucket = getInternalBucketName(bucketName)

  const res = await s3.putObject({ Bucket: bucket, Key: key, ContentType: contentType, Body: body }).promise()
  return res
}

export async function deleteAppFile(bucketName: any, key: any, credentials: any): Promise<any> {
  const s3 = getS3Client(credentials)
  const bucket = getInternalBucketName(bucketName)

  const res = await s3.deleteObject({ Bucket: bucket, Key: key }).promise()
  return res
}

function getS3Client(credentials: { accessKeyId: any; secretAccessKey: any; sessionToken: any }) {
  const endpoint = appStore.ossExternalEndpoint.toString()
  return new AWS.S3({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
    endpoint,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: 'us-east-1',
  })
}

function getInternalBucketName(bucketName: any) {
  const appid = appStore.currentApp.appid
  return `${appid}-${bucketName}`
}

/**
 * update sevice account
 * @returns
 */
export async function updateAC() {
  const appid = appStore.currentApp.appid
  const res: any = await request({
    url: `/sys-api/apps/${appid}/oss/buckets/service-account`,
    method: 'post',
  })

  return res
}
