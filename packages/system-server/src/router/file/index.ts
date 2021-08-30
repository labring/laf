/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-30 16:24:58
 * @Description: 
 */

import * as express from 'express'
import { handleGetFileBuckets } from './get-buckets'
import { handleCreateFileBuckets } from './add-bucket'
import { handleDeleteFileBuckets } from './delete-bucket'
import { handleGetFiles } from './get-files'
import { handleDeleteFile } from './delete-file'

export const FileRouter = express.Router()

/**
 * Get file bucket list
 */
FileRouter.get('/buckets', handleGetFileBuckets)

/**
 * Create a bucket
 */
FileRouter.post('/buckets', handleCreateFileBuckets)

/**
 * Delete a bucket
 */
FileRouter.delete('/buckets/:bucket', handleDeleteFileBuckets)

/**
 * Get file list in bucket
 */
FileRouter.get('/:bucket/files', handleGetFiles)

/**
 * delete file in bucket by file id
 */
FileRouter.delete('/:bucket/:id', handleDeleteFile)
