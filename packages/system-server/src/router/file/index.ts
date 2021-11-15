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
import { handleGetFiles } from './get-files'
import { handleDeleteFile } from './delete-file'
import { handleUpdateBucket } from './update-bucket'

export const FileRouter = express.Router()

/**
 * Get file bucket list
 */
FileRouter.get('/buckets', handleGetBuckets)

/**
 * Get a bucket detail
 */
FileRouter.get('/buckets/:bucket', handleGetOneBucket)

/**
 * Create a bucket
 */
FileRouter.post('/buckets', handleCreateBucket)

/**
 * Update a bucket
 */
FileRouter.put('/buckets/:bucket', handleUpdateBucket)

/**
 * Delete a bucket
 */
FileRouter.delete('/buckets/:bucket', handleDeleteBucket)

/**
 * Get file list in bucket
 */
FileRouter.get('/:bucket/files', handleGetFiles)

/**
 * delete file in bucket by file id
 */
FileRouter.delete('/:bucket/:id', handleDeleteFile)
