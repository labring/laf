import { RequestHandler } from 'express'
import { DatabaseAgent } from '../db'
import ensureCollectionExist from '../helper/ensure-collection-exist'

const addFunctionLog: RequestHandler = async (req, res) => {
  const { appid, log } = req.body

  if (!appid) {
    return res.status(400).send('appid is required')
  }

  if (!log || typeof log !== 'object' || !log.request_id || !log.func) {
    return res.status(400).send('bad log format')
  }

  await ensureCollectionExist(appid)

  await DatabaseAgent.db.collection(appid).insertOne(log)

  res.send('ok')
}

export default addFunctionLog
