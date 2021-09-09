import * as assert from "assert"
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

  async insert(data: any) {
    const db = DatabaseAgent.sys_db
    const r = await db.collection(Constants.cn.recycles)
      .add({
        collection: this.collection,
        data,
        created_at: Date.now()
      })

    return r.id
  }

  async retrieve(_id: string) {
    const db = DatabaseAgent.sys_db
    const r = await db.collection(Constants.cn.recycles)
      .where({ _id: _id, collection: this.collection })
      .getOne()

    return r.data
  }

  async remove(_id: string) {
    const db = DatabaseAgent.sys_db
    const r = await db.collection(Constants.cn.recycles)
      .where({ _id: _id, collection: this.collection })
      .remove()

    return r.deleted
  }
}