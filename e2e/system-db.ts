import { Config } from './config'
import { MongoClient } from 'mongodb'

export async function getDbClient() {
  const client = new MongoClient(Config.MONGO_URI)
  await client.connect()
  return client
}

export async function getDb() {
  const client = await getDbClient()
  return client.db()
}
