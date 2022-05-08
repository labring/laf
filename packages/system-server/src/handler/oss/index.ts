/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-11-13 18:52:06
 * @Description: 
 */

import * as express from 'express'
import { handleGetBuckets, handleGetOneBucket } from './get-buckets'
import { handleCreateBucket } from './add-bucket'
import { handleDeleteBucket } from './delete-bucket'
import { handleSetBucketPolicy } from './update-bucket'
import { handleUpdateServiceAccount } from './update-service-account'

export const OSSRouter = express.Router()

/**
 * Get file bucket list
 */
OSSRouter.get('/buckets', handleGetBuckets)

/**
 * Get a bucket detail
 */
OSSRouter.get('/buckets/:bucket', handleGetOneBucket)

/**
 * Create a bucket
 */
OSSRouter.post('/buckets', handleCreateBucket)

/**
 * Update a bucket
 */
OSSRouter.put('/buckets/:bucket', handleSetBucketPolicy)

/**
 * Delete a bucket
 */
OSSRouter.delete('/buckets/:bucket', handleDeleteBucket)


/**
 * update application service account
 */
OSSRouter.post('/buckets/service-account', handleUpdateServiceAccount)