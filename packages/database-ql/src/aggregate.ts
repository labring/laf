import { Db } from './index'
// import { EJSON } from 'bson'
import { QuerySerializer } from './serializer/query'
export default class Aggregation {
  _db: Db
  _request: any
  _stages: any[]
  _collectionName: string
  constructor(db?: Db, collectionName?: string) {
    this._stages = []

    if (db && collectionName) {
      this._db = db
      this._request = new Db.reqClass(this._db.config)
      this._collectionName = collectionName
    }
  }

  async end() {
    if (!this._collectionName || !this._db) {
      throw new Error('Aggregation pipeline cannot send request')
    }
    const result = await this._request.send('database.aggregate', {
      collectionName: this._collectionName,
      stages: this._stages
    })
    if (result && result.data && result.data.list) {
      return {
        requestId: result.requestId,
        // data: JSON.parse(result.data.list).map(EJSON.parse)
        data: result.data.list
      }
    }
    return result
  }

  unwrap() {
    return this._stages
  }

  done() {
    return this._stages.map(({ stageKey, stageValue }) => {
      return {
        [stageKey]: JSON.parse(stageValue)
      }
    })
  }

  _pipe(stage, param) {
    this._stages.push({
      stageKey: `$${stage}`,
      stageValue: JSON.stringify(param)
    })
    return this
  }

  addFields(param) {
    return this._pipe('addFields', param)
  }

  bucket(param) {
    return this._pipe('bucket', param)
  }

  bucketAuto(param) {
    return this._pipe('bucketAuto', param)
  }

  count(param) {
    return this._pipe('count', param)
  }

  geoNear(param) {
    return this._pipe('geoNear', param)
  }

  group(param) {
    return this._pipe('group', param)
  }

  limit(param) {
    return this._pipe('limit', param)
  }

  match(param) {
    return this._pipe('match', QuerySerializer.encode(param))
  }

  project(param) {
    return this._pipe('project', param)
  }

  lookup(param) {
    return this._pipe('lookup', param)
  }

  replaceRoot(param) {
    return this._pipe('replaceRoot', param)
  }

  sample(param) {
    return this._pipe('sample', param)
  }

  skip(param) {
    return this._pipe('skip', param)
  }

  sort(param) {
    return this._pipe('sort', param)
  }

  sortByCount(param) {
    return this._pipe('sortByCount', param)
  }

  unwind(param) {
    return this._pipe('unwind', param)
  }
}
