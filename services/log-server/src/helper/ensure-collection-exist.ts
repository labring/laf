import Config from '../config'
import { DatabaseAgent } from '../db'

const cache: Record<string, boolean> = {}

const ensureCollectionExist = async (appid: string) => {
  if (!appid) throw new Error('appid is required')
  if (cache[appid]) return true

  const colls = await DatabaseAgent.db
    .listCollections({ name: appid })
    .toArray()

  if (colls.length > 0) {
    cache[appid] = true
    return true
  }

  await DatabaseAgent.db.createCollection(appid, {
    capped: true,
    max: Config.LOG_CAP,
    size: Config.LOG_SIZE,
  })
  await DatabaseAgent.db.collection(appid).createIndex({ created_at: 1 })

  cache[appid] = true

  return true
}

export default ensureCollectionExist
