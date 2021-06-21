import * as express from 'express'
import { checkPermission } from '../../lib/api/permission'
import { accessor } from '../../lib/db'
import { getLogger } from '../../lib/logger'


export const DbmRouter = express.Router()
const logger = getLogger('admin:api')


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