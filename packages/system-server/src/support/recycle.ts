import * as assert from "assert"
import { ObjectId } from "mongodb"
import { CN_RECYCLES } from "../constants"
import { DatabaseAgent } from "../db"

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
    const r = await db.collection(CN_RECYCLES)
      .insertOne({
        collection: this.collection,
        data,
        created_at: new Date(),
      })

    return r.insertedId
  }

  async retrieve(_id: string) {
    const db = DatabaseAgent.db
    const doc = await db.collection(CN_RECYCLES)
      .findOne({ _id: new ObjectId(_id), collection: this.collection })

    return doc
  }

  async remove(_id: string) {
    const db = DatabaseAgent.db
    const r = await db.collection(CN_RECYCLES)
      .deleteOne({ _id: new ObjectId(_id), collection: this.collection })

    return r.deletedCount
  }
}