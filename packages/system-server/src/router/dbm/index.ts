/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-30 16:34:17
 * @Description: 
 */

import * as express from 'express'
import { handleDbProxy } from './proxy'
import { handleCollectionList } from './get'
import { handleGetIndexesOfCollection } from './get-indexes'
import { handleCreateIndex } from './add-index'
import { handleDeleteIndex } from './delete-index'

export const DbmRouter = express.Router()

/**
 * The less-api proxy entry for database management
 */
DbmRouter.post('/entry', handleDbProxy)

/**
 * Get collection name lists
 */
DbmRouter.get('/collections', handleCollectionList)


/**
 * Get indexes of collection
 */
DbmRouter.get('/collection/indexes', handleGetIndexesOfCollection)

/**
 * Create index to collection
 */
DbmRouter.post('/collection/indexes', handleCreateIndex)

/**
 * Delete index of collection
 */
DbmRouter.delete('/collection/indexes', handleDeleteIndex)

