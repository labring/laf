import * as assert from "assert"
import { ObjectId } from "mongodb"
import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"

/**
 * Recycle collector
 */
export class RecycleCollector {
  collection: string

  constructor(collection: string) {
    assert.ok(collection, 'empty collection got')
    this.collection = collection
  }

  async insert(data: any): Promise<ObjectId> {
    const db = DatabaseAgent.db
    const r = await db.collection(Constants.cn.recycles)
      .insertOne({
        collection: this.collection,
        data,
        created_at: Date.now()
      })

    return r.insertedId
  }

  async retrieve(_id: string) {
    const db = DatabaseAgent.db
    const doc = await db.collection(Constants.cn.recycles)
      .findOne({ _id: new ObjectId(_id), collection: this.collection })

    return doc
  }

  async remove(_id: string) {
    const db = DatabaseAgent.db
    const r = await db.collection(Constants.cn.recycles)
      .deleteOne({ _id: new ObjectId(_id), collection: this.collection })

    return r.deletedCount
  }
}