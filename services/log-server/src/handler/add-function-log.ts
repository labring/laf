import { RequestHandler } from 'express'
import { DatabaseAgent } from '../db'
import ensureCollectionExist from '../helper/ensure-collection-exist'
import verifyAppid from '../helper/verify-appid'

const addFunctionLog: RequestHandler = async (req, res) => {
  const { appid, log } = req.body
  const token = req.headers['x-token'] as string

  if (!appid) {
    return res.status(400).send('appid is required')
  }

  if (!token || !verifyAppid(appid, token)) {
    return res.status(403).send('forbidden')
  }

  if (!log || typeof log !== 'object' || !log.func) {
    return res.status(400).send('bad log format')
  }

  await ensureCollectionExist(appid)

  await DatabaseAgent.db.collection(appid).insertOne(log)

  res.send('ok')
}

export default addFunctionLog
