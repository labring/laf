import * as express from 'express'
import { checkPermission } from '../../api/permission'
import { Globals } from '../../lib/globals'
import { createLogger } from '../../lib/logger'


const accessor = Globals.accessor
export const DbmRouter = express.Router()
const logger = createLogger('admin:api')

/**
 * 获取集合列表
 */
DbmRouter.get('/collections', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] get /collections`)

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'collections.get')
  if (code) {
    return res.status(code).send()
  }

  const colls = await accessor.db.collections()
  const names = colls.map(coll => coll.collectionName)

  return res.send(names)
})


/**
 * 获取集合索引列表
 */
DbmRouter.get('/collection/indexes', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] get /collection/indexes`)

  // 权限验证
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
 * 创建集合索引
 */
DbmRouter.post('/collection/indexes', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] post /collection/indexes`)

  // 权限验证
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
 * 删除集合索引
 */
DbmRouter.delete('/collection/indexes', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] post /collection/indexes`)

  // 权限验证
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
 * 检查 index spec 合法性
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