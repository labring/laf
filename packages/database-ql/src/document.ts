
import { Db } from './index'
import { UpdateSerializer } from './serializer/update'
import { serialize } from './serializer/datatype'
import { UpdateCommand } from './commands/update'
import { QueryType } from './constant'
import { AddRes, GetOneRes, RemoveRes, UpdateRes } from './result-types'
import { RequestInterface } from './interface'
// import { Util } from './util'


/**
 * 文档模块
 *
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
  private request: RequestInterface

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
    this.request = this._db.request
    this.projection = projection
  }

  /**
   * 创建一篇文档
   *
   * @param data - 文档数据
   * @internal
   */
  async create(data: any, options?: { multi: boolean }): Promise<AddRes> {
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

    const res = await this.request
      .send('database.addDocument', params)

    if (res.error) {
      return {
        requestId: res.requestId,
        error: res.error,
        ok: false,
        id: undefined,
        insertedCount: undefined
      }
    }

    return {
      id: res.data._id || res.data[this.primaryKey],
      insertedCount: res.data.insertedCount,
      requestId: res.requestId,
      ok: true
    }
  }

  /**
   * 创建或添加数据
   *
   * 如果文档ID不存在，则创建该文档并插入数据，根据返回数据的 upsertId 判断
   * 添加数据的话，根据返回数据的 set 判断影响的行数
   *
   * @param data - 文档数据
   */
  async set(data: Object): Promise<UpdateRes> {
    if (!this.id) {
      return {
        code: 'INVALID_PARAM',
        error: 'docId 不能为空'
      }
    }

    if (!data || typeof data !== 'object') {
      return {
        code: 'INVALID_PARAM',
        error: '参数必需是非空对象'
      }
    }

    if (data.hasOwnProperty('_id')) {
      return {
        code: 'INVALID_PARAM',
        error: '不能更新 _id 的值'
      }
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

    const res = await this.request
      .send('database.updateDocument', param)
    if (res.error) {
      return {
        requestId: res.requestId,
        error: res.error,
        ok: false,
      }
    }

    return {
      updated: res.data.updated,
      matched: res.data.matched,
      upsertId: res.data.upserted_id,
      requestId: res.requestId,
      ok: true
    }
  }

  /**
   * 更新数据
   *
   * @param data - 文档数据
   */
  async update(data: Object): Promise<UpdateRes> {

    if (!data || typeof data !== 'object') {
      return {
        code: 'INVALID_PARAM',
        error: '参数必需是非空对象'
      }
    }

    if (data.hasOwnProperty('_id')) {
      return {
        code: 'INVALID_PARAM',
        error: '不能更新 _id 的值'
      }
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

    const res = await this.request.send('database.updateDocument', param)
    if (res.error) {
      return {
        requestId: res.requestId,
        error: res.error,
        ok: false
      }
    }

    return {
      updated: res.data.updated,
      matched: res.data.matched,
      upsertId: res.data.upserted_id,
      requestId: res.requestId,
      ok: true
    }
  }

  /**
   * 删除文档
   */
  async remove(): Promise<RemoveRes> {
    const query = { [this.primaryKey]: this.id }
    const param = {
      collectionName: this._coll,
      query: query,
      queryType: QueryType.DOC,
      multi: false
    }

    const res = await this.request.send('database.deleteDocument', param)
    if (res.error) {
      return {
        requestId: res.requestId,
        error: res.error,
        deleted: undefined,
        ok: false
      }
    }

    return {
      deleted: res.data.deleted,
      requestId: res.requestId,
      ok: true
    }
  }

  /**
   * 返回选中的文档
   */
  async get<T = any>(): Promise<GetOneRes<T>> {

    const query = { [this.primaryKey]: this.id }
    const param = {
      collectionName: this._coll,
      query: query,
      queryType: QueryType.DOC,
      multi: false,
      projection: this.projection
    }

    const res = await this.request.send('database.queryDocument', param)
    if (res.error) {
      return {
        requestId: res.requestId,
        error: res.error,
        ok: false
      }
    }

    const docs = res.data.list
    const data: any = docs?.length ? docs[0] : undefined
    return {
      data: data,
      requestId: res.requestId,
      ok: true
    }
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
