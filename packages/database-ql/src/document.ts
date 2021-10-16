
import { Db } from './index'
import { serialize } from './serializer/datatype'
import { UpdateCommand } from './commands/update'
import { ActionType } from './constant'
import { AddRes, GetOneRes, RemoveRes, UpdateRes } from './result-types'
import { ProjectionType } from './interface'
import { Query } from './query'


/**
 * Db document 
 */
export class DocumentReference {
  /**
   * document id
   */
  readonly id: any

  /**
   * query object
   */
  private _query: Query

  /**
   * db reference
   */
  private _db: Db

  /**
   * collection name
   */
  readonly _coll: string

  /**
   * @param db    - db ref
   * @param coll  - collection
   * @param docID - document id
   */
  constructor(db: Db, coll: string, docID: any, query?: Query) {
    this._db = db
    this._coll = coll
    this.id = docID
    this._query = query || new Query(db, coll)
  }

  /**
   * 创建一篇文档
   *
   * @param data - document data
   */
  async create(data: any, options?: { multi: boolean }): Promise<AddRes> {
    if (!data || typeof data !== 'object' || 0 === Object.keys(data)?.length) {
      throw new Error('data cannot be empty object')
    }

    const params = {
      collectionName: this._coll,
      data: serialize(data),
      multi: options?.multi ?? false
    }

    const res = await this._query
      .send(ActionType.add, params)

    if (res.error) {
      return {
        requestId: res.requestId,
        error: res.error,
        ok: false,
        id: undefined,
        insertedCount: undefined,
        code: res.code
      }
    }

    return {
      id: res.data._id || res.data[this._db.primaryKey],
      insertedCount: res.data.insertedCount,
      requestId: res.requestId,
      ok: true
    }
  }

  /**
   * 创建或添加数据
   *
   * 如果该文档 ID 在数据库中不存在，则创建该文档并插入数据，根据返回数据的 upsertId 判断
   *
   * @param data - document data
   */
  async set(data: Object): Promise<UpdateRes> {
    if (!this.id) {
      throw new Error('document id cannot be empty')
    }

    let hasOperator = false
    const checkMixed = (objs: any) => {
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
      // 不能包含操作符
      throw new Error('data cannot contain operator')
    }

    // merge === false indicates replace operation
    const merge = false
    const res = await this._query
      .where({ [this._db.primaryKey]: this.id })
      .update(serialize(data), { merge, multi: false, upsert: true })
    return res
  }

  /**
   * 更新数据
   *
   * @param data - 文档数据
   */
  async update(data: Object): Promise<UpdateRes> {
    // 把所有更新数据转为带操作符的
    const merge = true
    const options = { merge, multi: false, upsert: false }

    const res = await this._query
      .where({ [this._db.primaryKey]: this.id })
      .update(data, options)
    return res
  }

  /**
   * 删除文档
   */
  async remove(): Promise<RemoveRes> {
    const res = await this._query
      .where({ [this._db.primaryKey]: this.id })
      .remove({ multi: false })
    return res
  }

  /**
   * 返回选中的文档
   */
  async get<T = any>(): Promise<GetOneRes<T>> {
    const res = await this._query
      .where({ [this._db.primaryKey]: this.id })
      .getOne()
    return res
  }

  /**
   * 指定要返回的字段
   *
   * @param projection
   */
  field(projection: string[] | ProjectionType): DocumentReference {
    return new DocumentReference(this._db, this._coll, this.id, this._query.field(projection))
  }
}
