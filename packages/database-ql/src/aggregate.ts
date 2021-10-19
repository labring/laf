import { Db } from './index'
import { QuerySerializer } from './serializer/query'
import { stringifyByEJSON } from './utils/utils'
import { getType } from './utils/type'
import { Validate } from './validate'
import { AggregateStage, RequestInterface } from './interface'
import { ActionType } from './constant'
import { GetRes } from './result-types'
import { Util } from './util'

const EARTH_RADIUS = 6378100

export default class Aggregation {
  _db: Db
  _request: RequestInterface
  _stages: AggregateStage[]
  _collectionName: string

  constructor(db?: Db, collectionName?: string, rawPipeline?: any[]) {
    this._stages = []

    if (db && collectionName) {
      this._db = db
      this._request = this._db.request
      this._collectionName = collectionName

      if (rawPipeline && rawPipeline.length > 0) {
        rawPipeline.forEach((stage) => {
          Validate.isValidAggregation(stage)
          const stageName = Object.keys(stage)[0]
          this._pipe(stageName, stage[stageName], true)
        })
      }
    }
  }

  async end<T = any>() {
    if (!this._collectionName || !this._db) {
      throw new Error('Aggregation pipeline cannot send request')
    }

    if (!this._stages?.length) {
      throw new Error('Aggregation stage cannot be empty')
    }

    const res = await this._request.send(ActionType.aggregate, {
      collectionName: this._collectionName,
      stages: this._stages
    })

    if (res.error) {
      return {
        error: res.error,
        data: res.data,
        requestId: res.requestId,
        ok: false,
        code: res.code
      }
    }

    const documents: any[] = Util.formatResDocumentData(res.data.list)
    const result: GetRes<T> = {
      data: documents,
      requestId: res.requestId,
      ok: true
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

  _pipe(stage: string, param: any, raw = false) {
    // 区分param是否为字符串
    let transformParam = ''
    if (getType(param) === 'object') {
      transformParam = stringifyByEJSON(param)
    } else {
      transformParam = JSON.stringify(param)
    }

    this._stages.push({
      stageKey: raw ? stage : `$${stage}`,
      stageValue: transformParam
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
    if (param.query) {
      param.query = QuerySerializer.encode(param.query)
    }

    // 判断是否有 distanceMultiplier 参数
    if (param.distanceMultiplier && typeof (param.distanceMultiplier) === 'number') {
      param.distanceMultiplier = param.distanceMultiplier * EARTH_RADIUS
    } else {
      param.distanceMultiplier = EARTH_RADIUS
    }
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
