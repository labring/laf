import { createPromiseCallback } from './lib/util'
import { Db } from './index'
import { Util } from './util'
import { UpdateSerializer } from './serializer/update'
import { serialize } from './serializer/datatype'
import { UpdateCommand } from './commands/update'
import { QueryType } from './constant'
import { AddRes, GetRes, RemoveRes, UpdateRes } from './result-types'


/**
 * 文档模块
 *
 * @author haroldhu
 */
export class DocumentReference {
  /**
   * 文档ID
   */
  readonly id: string | number

  /**
   *
   */
  readonly projection: Object

  /**
   * 数据库引用
   *
   * @internal
   */
  private _db: Db

  get primaryKey(): string {
    return this._db.primaryKey
  }

  /**
   * 集合名称
   *
   * @internal
   */
  readonly _coll: string

  /**
   * Request 实例
   *
   * @internal
   */
  private request: any

  /**
   * 初始化
   *
   * @internal
   *
   * @param db    - 数据库的引用
   * @param coll  - 集合名称
   * @param docID - 文档ID
   */
  constructor(db: Db, coll: string, docID: string | number, projection = {}) {
    this._db = db
    this._coll = coll
    this.id = docID
    /* eslint-disable new-cap*/
    this.request = new Db.reqClass(this._db.config)
    this.projection = projection
  }

  /**
   * 创建一篇文档
   *
   * @param data - 文档数据
   * @internal
   */
  create(data: any, options?: { multi: boolean }, callback?: any): Promise<AddRes> {
    callback = callback || createPromiseCallback()
    if (!options) {
      options = { multi: false }
    } else {
      options.multi = options.multi ?? false
    }

    let params = {
      collectionName: this._coll,
      // data: Util.encodeDocumentDataForReq(data, false, false)
      data: serialize(data),
      multi: options.multi
    }

    if (this.id) {
      params[`${this.primaryKey}`] = this.id
    }

    this.request
      .send('database.addDocument', params)
      .then(res => {
        if (res.code) {
          callback(0, res)
        } else {
          callback(0, {
            id: res.data._id || res.data.id,
            insertedCount: res.data.insertedCount,
            requestId: res.requestId,
            ok: true
          })
        }
      })
      .catch(err => {
        callback(err)
      })

    return callback.promise
  }

  /**
   * 创建或添加数据
   *
   * 如果文档ID不存在，则创建该文档并插入数据，根据返回数据的 upserted_id 判断
   * 添加数据的话，根据返回数据的 set 判断影响的行数
   *
   * @param data - 文档数据
   */
  set(data: Object, callback?: any): Promise<UpdateRes> {
    callback = callback || createPromiseCallback()

    if (!this.id) {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        error: 'docId不能为空'
      })
    }

    if (!data || typeof data !== 'object') {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        error: '参数必需是非空对象'
      })
    }

    if (data.hasOwnProperty('_id')) {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        error: '不能更新_id的值'
      })
    }

    let hasOperator = false
    const checkMixed = objs => {
      if (typeof objs === 'object') {
        for (let key in objs) {
          if (objs[key] instanceof UpdateCommand) {
            hasOperator = true
          } else if (typeof objs[key] === 'object') {
            checkMixed(objs[key])
          }
        }
      }
    }
    checkMixed(data)

    if (hasOperator) {
      //不能包含操作符
      return Promise.resolve({
        code: 'DATABASE_REQUEST_FAILED',
        error: 'update operator complicit'
      })
    }

    const merge = false //data不能带有操作符
    let param = {
      collectionName: this._coll,
      queryType: QueryType.DOC,
      // data: Util.encodeDocumentDataForReq(data, merge, false),
      data: serialize(data),
      multi: false,
      merge,
      upsert: true
    }

    if (this.id) {
      param['query'] = { [this.primaryKey]: this.id }
    }

    this.request
      .send('database.updateDocument', param)
      .then(res => {
        if (res.code) {
          callback(0, res)
        } else {
          callback(0, {
            updated: res.data.updated,
            matched: res.data.matched,
            upsertedId: res.data.upserted_id,
            requestId: res.requestId,
            ok: true
          })
        }
      })
      .catch(err => {
        callback(err)
      })

    return callback.promise
  }

  /**
   * 更新数据
   *
   * @param data - 文档数据
   */
  update(data: Object, callback?: any): Promise<UpdateRes> {
    callback = callback || createPromiseCallback()

    if (!data || typeof data !== 'object') {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        error: '参数必需是非空对象'
      })
    }

    if (data.hasOwnProperty('_id')) {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        error: '不能更新_id的值'
      })
    }

    const query = { [this.primaryKey]: this.id }
    const merge = true //把所有更新数据转为带操作符的
    const param = {
      collectionName: this._coll,
      // data: Util.encodeDocumentDataForReq(data, merge, true),
      data: UpdateSerializer.encode(data),
      query: query,
      queryType: QueryType.DOC,
      multi: false,
      merge,
      upsert: false
    }

    this.request
      .send('database.updateDocument', param)
      .then(res => {
        if (res.code) {
          callback(0, res)
        } else {
          callback(0, {
            updated: res.data.updated,
            matched: res.data.matched,
            upsertedId: res.data.upserted_id,
            requestId: res.requestId,
            ok: true
          })
        }
      })
      .catch(err => {
        callback(err)
      })

    return callback.promise
  }

  /**
   * 删除文档
   */
  remove(callback?: any): Promise<RemoveRes> {
    callback = callback || createPromiseCallback()

    const query = { [this.primaryKey]: this.id }
    const param = {
      collectionName: this._coll,
      query: query,
      queryType: QueryType.DOC,
      multi: false
    }

    this.request
      .send('database.deleteDocument', param)
      .then(res => {
        if (res.code) {
          callback(0, res)
        } else {
          callback(0, {
            deleted: res.data.deleted,
            requestId: res.requestId,
            ok: true
          })
        }
      })
      .catch(err => {
        callback(err)
      })

    return callback.promise
  }

  /**
   * 返回选中的文档
   */
  get<T = any>(callback?: any): Promise<GetRes<T>> {
    callback = callback || createPromiseCallback()

    const query = { [this.primaryKey]: this.id }
    const param = {
      collectionName: this._coll,
      query: query,
      queryType: QueryType.DOC,
      multi: false,
      projection: this.projection
    }
    this.request
      .send('database.queryDocument', param)
      .then(res => {
        if (res.code) {
          callback(0, res)
        } else {
          const documents = Util.formatResDocumentData(res.data.list)
          callback(0, {
            data: documents,
            requestId: res.requestId,
            total: res.TotalCount,
            limit: res.Limit,
            offset: res.Offset,
            ok: true
          })
        }
      })
      .catch(err => {
        callback(err)
      })

    return callback.promise
  }

  /**
   *
   */
  field(projection: Object): DocumentReference {
    for (let k in projection) {
      if (projection[k]) {
        projection[k] = 1
      } else {
        projection[k] = 0
      }
    }
    return new DocumentReference(this._db, this._coll, this.id, projection)
  }
}
