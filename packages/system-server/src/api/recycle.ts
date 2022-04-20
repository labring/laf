import * as assert from "assert"
import { ObjectId } from "mongodb"
import { Constants } from "../constants"
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
    const r = await db.collection(Constants.colls.recycles)
      .insertOne({
        collection: this.collection,
        data,
        created_at: new Date(),
      })

    return r.insertedId
  }

  async retrieve(_id: string) {
    const db = DatabaseAgent.db
    const doc = await db.collection(Constants.colls.recycles)
      .findOne({ _id: new ObjectId(_id), collection: this.collection })

    return doc
  }

  async remove(_id: string) {
    const db = DatabaseAgent.db
    const r = await db.collection(Constants.colls.recycles)
      .deleteOne({ _id: new ObjectId(_id), collection: this.collection })

    return r.deletedCount
  }
}