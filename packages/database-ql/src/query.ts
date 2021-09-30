import { createPromiseCallback } from './lib/util'
import { OrderByDirection, QueryType } from './constant'
import { Db } from './index'
import { Validate } from './validate'
import { Util } from './util'
import { QuerySerializer } from './serializer/query'
import { UpdateSerializer } from './serializer/update'
import { ErrorCode } from './constant'
import { GetOneRes, GetRes, CountRes, UpdateRes, RemoveRes } from './result-types'



interface QueryOrder {
  field?: string
  direction?: 'asc' | 'desc'
}

interface QueryOption {
  // 查询数量
  limit?: number
  // 偏移量
  offset?: number
  // 指定显示或者不显示哪些字段
  projection?: Object
}

// left, right, inner, full
enum JoinType {
  INNER = 'inner',
  LEFT = 'left',
  RIGHT = 'right',
  FULL = 'full'
}

interface JoinParam {
  collection: string,
  type: JoinType,
  leftKey: string,    // 左表连接键
  rightKey: string    // 右表连接键
}

interface WithParam {
  /**
   * 子查询
   */
  query: Query

  /**
   * 主表联接键（关联字段）
   */       
  localField: string

  /**
   * 子表联接键（外键）
   */
  foreignField: string,

  /**
   * 结果集字段重命名，缺省则用子表名
   */
  as?: string,
  
  /**
   * 是否是一对一查询，只在 Query.withOne() 中使用
   */
  one?: boolean,
}


/**
 * 查询模块
 *
 * @author haroldhu
 */
export class Query {
  /**
   * Db 的引用
   *
   * @internal
   */
  protected _db: Db

  /**
   * Collection name
   *
   * @internal
   */
  protected _coll: string

  /**
   * 过滤条件
   *
   * @internal
   */
  private _fieldFilters: Object

  /**
   * 排序条件
   *
   * @internal
   */
  private _fieldOrders: QueryOrder[]

  /**
   * 查询条件
   *
   * @internal
   */
  private _queryOptions: QueryOption

  /**
   * 联表条件(join)
   * 
   * @internal
   */
  private _joins: JoinParam[]

  /**
   * 子表查询（一对多）
   * 
   * @internal
   */
  private _withs: WithParam[]

  /**
   * 原始过滤参数
   */
  // private _rawWhereParams: Object

  /**
   * 请求实例
   *
   * @internal
   */
  private _request: any

  /**
   * 初始化
   *
   * @internal
   *
   * @param db            - 数据库的引用
   * @param coll          - 集合名称
   * @param fieldFilters  - 过滤条件
   * @param fieldOrders   - 排序条件
   * @param queryOptions  - 查询条件
   */
  public constructor(
    db: Db,
    coll: string,
    fieldFilters?: Object,
    fieldOrders?: QueryOrder[],
    queryOptions?: QueryOption,
    joins?: JoinParam[],
    withs?: WithParam[]
    // rawWhereParams?: Object
  ) {
    this._db = db
    this._coll = coll
    this._fieldFilters = fieldFilters
    this._fieldOrders = fieldOrders || []
    this._queryOptions = queryOptions || {}
    this._joins = joins || []
    this._withs = withs || []
    /* eslint-disable new-cap */
    this._request = new Db.reqClass(this._db.config)
  }

  /**
   * 查询条件
   *
   * @param query
   */
  public where(query: object) {
    // query校验 1. 必填对象类型  2. value 不可均为undefiend
    if (Object.prototype.toString.call(query).slice(8, -1) !== 'Object') {
      throw Error(ErrorCode.QueryParamTypeError)
    }

    const keys = Object.keys(query)

    const checkFlag = keys.some(item => {
      return query[item] !== undefined
    })

    if (keys.length && !checkFlag) {
      throw Error(ErrorCode.QueryParamValueError)
    }

    return new Query(
      this._db,
      this._coll,
      QuerySerializer.encode(query),
      this._fieldOrders,
      this._queryOptions,
      this._joins,
      this._withs
    )
  }

  /**
   * 设置排序方式
   *
   * @param fieldPath     - 字段路径
   * @param directionStr  - 排序方式
   */
  public orderBy(fieldPath: string, directionStr: OrderByDirection): Query {
    Validate.isFieldPath(fieldPath)
    Validate.isFieldOrder(directionStr)

    const newOrder: QueryOrder = {
      field: fieldPath,
      direction: directionStr
    }
    const combinedOrders = this._fieldOrders.concat(newOrder)

    return new Query(
      this._db,
      this._coll,
      this._fieldFilters,
      combinedOrders,
      this._queryOptions,
      this._joins,
      this._withs
    )
  }

  /**
   * 添加联表条件，实联接，即数据库支持的联表操作（仅 SQL 数据库支持）
   * @param type 联接类型, 以下值之一 "left", "inner", "right", "full"
   * @param collection 联接的子表名
   * @param rightKey 子表的联接键名
   * @param leftKey 主表的联接键名
   */
  public join(collection: string, rightKey: string, leftKey: string, type: JoinType = JoinType.INNER): Query {
    const newJoin: JoinParam = {
      type,
      collection,
      rightKey,
      leftKey
    }

    const combinedJoins = this._joins.concat(newJoin)
    return new Query(
      this._db,
      this._coll,
      this._fieldFilters,
      this._fieldOrders,
      this._queryOptions,
      combinedJoins,
      this._withs
    )
  }

  /**
   * 添加 left join 联表条件，实联接，即数据库支持的联表操作（仅 SQL 数据库支持）
   * @param collection 联接的子表名
   * @param rightKey 子表的联接键名
   * @param leftKey 主表的联接键名
   */
  public leftJoin(collection: string, rightKey: string, leftKey: string): Query {
    return this.join(collection, rightKey, leftKey, JoinType.LEFT)
  }

  /**
   * 添加 right join 联表条件，实联接，即数据库支持的联表操作（仅 SQL 数据库支持）
   * @param collection 联接的子表名
   * @param rightKey 子表的联接键名
   * @param leftKey 主表的联接键名
   */
  public rightJoin(collection: string, rightKey: string, leftKey: string): Query {
    return this.join(collection, rightKey, leftKey, JoinType.RIGHT)
  }

  /**
   * 添加 full join 联表条件，实联接，即数据库支持的联表操作（仅 SQL 数据库支持）
   * @param collection 联接的子表名
   * @param rightKey 子表的联接键名
   * @param leftKey 主表的联接键名
   */
  public fullJoin(collection: string, rightKey: string, leftKey: string): Query {
    return this.join(collection, rightKey, leftKey, JoinType.FULL)
  }

  /**
   * 添加 inner join 联表条件，实联接，即数据库支持的联表操作（仅 SQL 数据库支持）
   * @param collection 联接的子表名
   * @param rightKey 子表的联接键名
   * @param leftKey 主表的联接键名
   */
  public innerJoin(collection: string, rightKey: string, leftKey: string) {
    return this.join(collection, rightKey, leftKey, JoinType.INNER)
  }

  /**
   * 添加 一对多 子查询条件，需要使用 merge() 代替 get() 发起数据请求
   * @param param {WithParam}
   * @returns Query
   */
  public with(param: WithParam): Query {
    const newWith: WithParam = {
      query: param.query,
      foreignField: param.foreignField,
      localField: param.localField,
      as: param.as ?? param.query._coll,
      one: param.one ?? false
    }

    const combinedWiths = this._withs.concat(newWith)
    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, this._queryOptions, this._joins, combinedWiths)
  }

  /**
   * 添加 一对一 子查询条件，需要使用 merge() 代替 get() 发起数据请求
   * @param param {WithParam}
   * @returns Query
   */
  public withOne(param: WithParam): Query {
    const newWith: WithParam = {
      query: param.query,
      foreignField: param.foreignField,
      localField: param.localField,
      as: param.as ?? param.query._coll,
      one: true
    }

    const combinedWiths = this._withs.concat(newWith)
    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, this._queryOptions, this._joins, combinedWiths)
  }

  /**
   * 指定要返回的字段
   *
   * @param projection string[] | {[fieldName]: true | false}
   */
  public field(projection: string[] | any): Query {
    if (projection instanceof Array) {
      let result = {}
      for (let k of projection) {
        result[k] = 1
      }
      projection = result
    } else {
      for (let k in projection) {
        if (projection[k]) {
          if (typeof projection[k] !== 'object') {
            projection[k] = 1
          }
        } else {
          projection[k] = 0
        }
      }
    }


    let option = { ...this._queryOptions }
    option.projection = projection

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option, this._joins, this._withs)
  }

  /**
   * 设置查询条数
   *
   * @param limit - 限制条数
   */
  public limit(limit: number): Query {
    Validate.isInteger('limit', limit)

    let option = { ...this._queryOptions }
    option.limit = limit

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option, this._joins, this._withs)
  }

  /**
   * 设置偏移量
   *
   * @param offset - 偏移量
   */
  public skip(offset: number): Query {
    Validate.isInteger('offset', offset)

    let option = { ...this._queryOptions }
    option.offset = offset

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option, this._joins, this._withs)
  }

  /**
   * 克隆
   * @returns Query
   */
  public clone(): Query {
    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, this._queryOptions, this._joins, this._withs)
  }

  /**
   * 发起请求获取文档列表
   *
   * - 默认获取集合下全部文档数据
   * - 可以把通过 `orderBy`、`where`、`skip`、`limit`设置的数据添加请求参数上
   */
  public get<T = any>(options?: { nested?: boolean }, callback?: any): Promise<GetRes<T>> {
    /* eslint-disable no-param-reassign */
    callback = callback || createPromiseCallback()

    let newOder = []
    if (this._fieldOrders) {
      this._fieldOrders.forEach(order => {
        newOder.push(order)
      })
    }
    interface Param {
      collectionName: string
      query?: Object
      queryType: QueryType
      order?: string[]
      offset?: number
      limit?: number
      projection?: Object,
      joins?: JoinParam[],
      nested?: boolean
    }
    let param: Param = {
      collectionName: this._coll,
      queryType: QueryType.WHERE,
    }
    if (this._fieldFilters) {
      param.query = this._fieldFilters
    }
    if (newOder.length > 0) {
      param.order = newOder
    }
    if (this._queryOptions.offset) {
      param.offset = this._queryOptions.offset
    }
    if (this._queryOptions.limit) {
      param.limit = this._queryOptions.limit < 1000 ? this._queryOptions.limit : 1000
    } else {
      param.limit = 100
    }
    if (this._queryOptions.projection) {
      param.projection = this._queryOptions.projection
    }
    if (this._joins.length) {
      param.joins = this._joins
    }
    if (options) {
      param.nested = options.nested ?? false
    }
    this._request
      .send('database.queryDocument', param)
      .then(res => {
        if (res.code) {
          callback(0, res)
        } else {
          const documents = Util.formatResDocumentData(res.data.list)
          const result: any = {
            data: documents,
            requestId: res.requestId,
            ok: true
          }
          if (res.total) result.total = res.total
          if (res.limit) result.limit = res.limit
          if (res.offset) result.offset = res.offset
          callback(0, result)
        }
      })
      .catch(err => {
        callback(err)
      })

    return callback.promise
  }

  /**
   * 发起请求获取一个文档
   * @param options 
   * @returns 
   */
  public async getOne<T = any>(options?: { nested?: boolean }): Promise<GetOneRes<T>> {
    const res = await this.get<T>(options)
    if (res.code) {
      return res as any
    }

    if (!res.data.length) {
      return {
        ok: true,
        data: null,
        requestId: res.requestId
      } as any
    }

    return {
      ok: true,
      data: res.data[0],
      requestId: res.requestId
    } as any
  }

  /**
   * 发起请求获取文档列表，当使用 with 条件时使用
   * 
   * 1. 调用 get() 执行主查询
   * 2. 结合主查询的结果，使用 in 执行子表查询
   * 3. 合并主表 & 子表的结果，即聚合
   * 4. intersection 可指定是否取两个结果集的交集，缺省则以主表结果为主
   */
  public async merge<T = any>(options?: { nested?: boolean, intersection?: boolean }): Promise<GetRes<T>> {

    options = options ?? {} as any
    const intersection = options.intersection ?? false

    // 调用 get() 执行主查询
    const res = await this.get(options as any)
    if (!res.ok) {
      return res as any
    }

    // 针对每一个 WithParam 做合并处理
    for (let _with of this._withs) {
      const { query, localField, foreignField, as, one } = _with
      const localValues = res.data.map(localData => localData[localField])

      // 处理子查询
      let q = query.clone()

      if (!q._fieldFilters) {
        q._fieldFilters = {}
      }
      q._fieldFilters[foreignField] = { '$in': localValues }

      // 执行子查询
      let r_sub: (GetRes<T>)
      if (q._withs.length) {
        r_sub = await q.merge()  // 如果子查询也使用了 with/withOne，则使用 merge() 查询
      } else {
        r_sub = await q.get()
      }

      if (!r_sub.ok) {
        return r_sub
      }


      // 按照 localField -> foreignField 的连接关系将子查询结果聚合：

      // 1. 构建 { [value of `foreignField`]: [subQueryData] } 映射表
      const _map = {}
      for (let sub of r_sub.data) {
        const key = sub[foreignField]           // 将子表结果的连接键的值做为映射表的 key
        if (one) {
          _map[key] = sub
        } else {
          _map[key] = _map[key] || []
          _map[key].push(sub)           // 将子表结果放入映射表
        }
      }

      // 2. 将聚合结果合并入主表结果集中
      const results = []
      for (let m of res.data) {
        // 此处主表结果中的 [value of `localField`] 与 上面子表结果中的 [value of `foreignField`] 应该是一致的
        const key = m[localField]
        m[as] = _map[key]

        // 如果取交集且子表结果无对应数据，则丢弃此条数据
        if (intersection && !_map[key]) {
          continue
        }
        results.push(m)
      }

      res.data = results
    }

    return res as any
  }



  /**
   * 获取总数
   */
  public count(callback?: any): Promise<CountRes> {
    callback = callback || createPromiseCallback()

    interface Param {
      collectionName: string
      query?: Object
      queryType: QueryType,
      joins?: JoinParam[]
    }
    let param: Param = {
      collectionName: this._coll,
      queryType: QueryType.WHERE
    }
    if (this._fieldFilters) {
      param.query = this._fieldFilters
    }
    if (this._joins.length) {
      param.joins = this._joins
    }
    this._request.send('database.countDocument', param).then(res => {
      if (res.code) {
        callback(0, res)
      } else {
        callback(0, {
          requestId: res.requestId,
          total: res.data.total,
          ok: true
        })
      }
    })

    return callback.promise
  }

  /**
   * 发起请求批量更新文档
   *
   * @param data 数据
   */
  public update(data: Object, options?: { multi: boolean, merge: boolean, upsert: boolean }, callback?: any): Promise<UpdateRes> {
    callback = callback || createPromiseCallback()
    if (!options) {
      options = {
        multi: false,
        merge: true,
        upsert: false
      }
    } else {
      options.multi = options.multi ?? false
      options.merge = options.merge ?? true
      options.upsert = options.upsert ?? false
    }

    if (!data || typeof data !== 'object') {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        error: '参数必需是非空对象'
      } as any)
    }

    if (data.hasOwnProperty('_id')) {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        error: '不能更新_id的值'
      } as any)
    }

    let param = {
      collectionName: this._coll,
      query: this._fieldFilters,
      queryType: QueryType.WHERE,
      // query: QuerySerializer.encode(this._fieldFilters),
      multi: options.multi,
      merge: options.merge,
      upsert: options.upsert,
      data: UpdateSerializer.encode(data),
      joins: undefined
      // data: Util.encodeDocumentDataForReq(data, true)
      // data: this.convertParams(data)
    }
    if (this._joins.length) {
      param.joins = this._joins
    }

    this._request.send('database.updateDocument', param).then(res => {
      if (res.code) {
        callback(0, res)
      } else {
        callback(0, {
          requestId: res.requestId,
          updated: res.data.updated,
          upsertId: res.data.upsert_id,
          ok: true
        })
      }
    })

    return callback.promise
  }

  /**
   * 条件删除文档
   */
  public remove(options?: { multi: boolean }, callback?: any): Promise<RemoveRes> {
    callback = callback || createPromiseCallback()

    if (!options) {
      options = { multi: false }
    } else {
      options.multi = options.multi ?? false
    }

    if (Object.keys(this._queryOptions).length > 0) {
      console.warn('`offset`, `limit` and `projection` are not supported in remove() operation')
    }
    if (this._fieldOrders.length > 0) {
      console.warn('`orderBy` is not supported in remove() operation')
    }
    const param = {
      collectionName: this._coll,
      query: QuerySerializer.encode(this._fieldFilters),
      queryType: QueryType.WHERE,
      multi: options.multi,
      joins: undefined
    }
    if (this._joins.length) {
      param.joins = this._joins
    }
    this._request.send('database.deleteDocument', param).then(res => {
      if (res.code) {
        callback(0, res)
      } else {
        callback(0, {
          requestId: res.requestId,
          deleted: res.data.deleted,
          ok: true
        })
      }
    })

    return callback.promise
  }
}
