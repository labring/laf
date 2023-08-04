import { RequestHandler } from 'express'
import { DatabaseAgent } from '../db'
import ensureCollectionExist from '../helper/ensure-collection-exist'
import Config from '../config'

const getFunctionLog: RequestHandler = async (req, res) => {
  let { page, pageSize, requestId, functionName, appid } = req.query as Record<
    string,
    any
  >
  const token = req.headers['x-token'] as string

  if (!token || Config.JWT_SECRET !== token) {
    return res.status(403).send('forbidden')
  }

  if (!appid) {
    return res.status(400).send('appid is required')
  }

  page = Number(page) || 1
  pageSize = Number(pageSize) || 10

  await ensureCollectionExist(appid)

  const coll = DatabaseAgent.db.collection(appid)
  const query: any = {}
  if (requestId) {
    query.request_id = requestId
  }
  if (functionName) {
    query.func = functionName
  }

  const data = await coll
    .find(query, {
      limit: pageSize,
      skip: (page - 1) * pageSize,
      sort: { _id: -1 },
    })
    .toArray()

  const total = await coll.countDocuments(query)
  res.send({ data, total })
}

export default getFunctionLog
