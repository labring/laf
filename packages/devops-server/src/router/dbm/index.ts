/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 17:13:12
 * @Description: 
 */

import * as express from 'express'
import { Proxy, Policy } from 'less-api'
import { checkPermission } from '../../api/permission'
import { DatabaseAgent } from '../../lib/db-agent'
import { logger } from '../../lib/logger'


const accessor = DatabaseAgent.app_accessor

export const DbmRouter = express.Router()

/**
 * The less-api proxy entry for database management
 */
DbmRouter.post('/entry', async (req, res) => {
  const requestId = req['requestId']

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'database.manage')
  if (code) {
    return res.status(code).send()
  }

  const accessor = DatabaseAgent.app_accessor

  // don't need policy rules, open all collections' access permission for dbm use
  const entry = new Proxy(accessor, new Policy(accessor))

  // parse params
  const params = entry.parseParams({ ...req.body, requestId })

  // execute query
  try {
    const data = await entry.execute(params)

    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error
    })
  }
})

/**
 * Get collection name lists
 */
DbmRouter.get('/collections', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] get /collections`)

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'collections.get')
  if (code) {
    return res.status(code).send()
  }

  const collections = await accessor.db.listCollections().toArray()
  const names = collections.map(coll => coll.name)

  return res.send(names)
})


/**
 * Get indexes of collection
 */
DbmRouter.get('/collection/indexes', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] get /collection/indexes`)

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'collections.get')
  if (code) {
    return res.status(code).send()
  }

  const collectionName = req.query?.collection
  if (!collectionName) {
    return res.status(422).send('collection cannot be empty')
  }

  const r = await accessor.db.collection(collectionName as string).indexes()
  return res.send(r)
})

/**
 * Create index to collection
 */
DbmRouter.post('/collection/indexes', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] post /collection/indexes`)

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'collections.createIndex')
  if (code) {
    return res.status(code).send()
  }

  const collectionName = req.query?.collection
  if (!collectionName) {
    return res.status(422).send('collection cannot be empty')
  }

  const unique = req.body?.unique ?? false
  const spec = req.body.spec
  if (!validIndexSpec(spec)) {
    return res.status(422).send('invalid index spec')
  }

  try {
    const r = await accessor.db
      .collection(collectionName as string)
      .createIndex(spec, {
        background: true,
        unique: unique as boolean
      })

    return res.send(r)
  } catch (error) {
    return res.status(400).send(error)
  }
})

/**
 * Delete index of collection
 */
DbmRouter.delete('/collection/indexes', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] post /collection/indexes`)

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'collections.deleteIndex')
  if (code) {
    return res.status(code).send()
  }

  const collectionName = req.query?.collection
  if (!collectionName) {
    return res.status(422).send('collection cannot be empty')
  }

  const indexName = req.query?.index
  if (!indexName) {
    return res.status(422).send('invalid index name')
  }

  try {
    const r = await accessor.db
      .collection(collectionName as string)
      .dropIndex(indexName as string)

    return res.send(r)
  } catch (error) {
    return res.status(400).send(error)
  }
})


/**
 * check if index spec valid
 * @param spec 
 * @returns 
 */
function validIndexSpec(spec: any) {
  if (!spec) return false
  if (typeof spec !== 'object') {
    return false
  }

  const keys = Object.keys(spec)
  if (!keys || !keys.length) {
    return false
  }

  for (const k of keys) {
    if (typeof k !== 'string') return false
    if (k === '_id') return false

    if ([1, -1].includes(spec[k]) === false) {
      return false
    }
  }

  return true
}