import { ActionType, OrderByDirection } from './constant'
import { Db } from './index'
import { Validate } from './validate'
// import { Util } from './util'
import { QuerySerializer } from './serializer/query'
import { UpdateSerializer } from './serializer/update'
import { ErrorCode } from './constant'
import { GetOneRes, GetRes, CountRes, UpdateRes, RemoveRes } from './result-types'
import { ProjectionType, QueryOrder, RequestInterface, QueryParam } from './interface'
import { Util } from './util'
import { serialize } from './serializer/datatype'



interface QueryOption {
  /**
   * 查询数量
   */
  limit?: number

  /**
   * 偏移量
   */
  offset?: number

  /**
   * 指定显示或者不显示哪些字段
   */
  projection?: ProjectionType

  /**
   * 是否返回文档总数
   */
  count?: boolean
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
 * Db query
 */
export class Query {
  /**
   * Reference to db instance
   */
  protected _db: Db

  /**
   * Collection name
   */
  protected _coll: string

  /**
   * Query conditions
   */
  private _fieldFilters: Object

  /**
   * Order by conditions
   */
  private _fieldOrders: QueryOrder[]

  /**
   * Query options
   */
  private _queryOptions: QueryOption

  /**
   * Sub queries
   */
  private _withs: WithParam[]

  /**
   * Request instance
   */
  private _request: RequestInterface

  /**
   * @param db            - db reference 
   * @param coll          - collection name
   * @param fieldFilters  - query condition
   * @param fieldOrders   - order by condition
   * @param queryOptions  - query options
   */
  public constructor(
    db: Db,
    coll: string,
    fieldFilters?: Object,
    fieldOrders?: QueryOrder[],
    queryOptions?: QueryOption,
    withs?: WithParam[]
  ) {
    this._db = db
    this._coll = coll
    this._fieldFilters = fieldFilters
    this._fieldOrders = fieldOrders || []
    this._queryOptions = queryOptions || {}
    this._withs = withs || []
    this._request = this._db.request
  }

  /**
   * 查询条件
   *
   * @param query
   */
  public where(query: object) {
    // query校验 1. 必填对象类型  2. value 不可均为 undefiend
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

    const _query = QuerySerializer.encode(query)
    return new Query(
      this._db,
      this._coll,
      _query,
      this._fieldOrders,
      this._queryOptions,
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
      this._withs
    )
  }

  /**
   * 添加 一对多 子查询条件
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
    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, this._queryOptions, combinedWiths)
  }

  /**
   * 添加 一对一 子查询条件
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
    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, this._queryOptions, combinedWiths)
  }

  /**
   * 指定要返回的字段
   *
   * @param projection
   */
  public field(projection: string[] | ProjectionType): Query {
    let formatted = {} as ProjectionType
    if (projection instanceof Array) {
      let result = {} as ProjectionType
      for (let k of projection) {
        result[k] = 1
      }
      formatted = result
    } else {
      for (let k in projection) {
        if (projection[k]) {
          if (typeof projection[k] !== 'object') {
            formatted[k] = 1
          }
        } else {
          formatted[k] = 0
        }
      }
    }

    const option = { ...this._queryOptions }
    option.projection = formatted

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option, this._withs)
  }

  /**
   * 设置查询条数
   *
   * @param limit - 限制条数，当前限制一次请求获取数据条数不得大于 1000
   */
  public limit(limit: number): Query {
    Validate.isInteger('limit', limit)

    let option = { ...this._queryOptions }
    option.limit = limit

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option, this._withs)
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

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option, this._withs)
  }

  /**
   * 设置分页查询
   * @param options { current: number, size: number} `current` 是页码，默认为 `1`, `size` 是每页大小, 默认为 10
   */
  public page(options: { current: number, size: number }) {
    const current = options?.current || 1
    const size = options?.size || 10

    const query = this
      .skip((current - 1) * size)
      .limit(size)

    query._queryOptions.count = true

    return query
  }

  /**
   * 克隆
   * @returns Query
   */
  public clone(): Query {
    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, this._queryOptions, this._withs)
  }

  /**
   * 发起请求获取文档列表
   *
   * - 默认 `limit` 为 100
   * - 可以把通过 `orderBy()`、`where()`、`skip()`、`limit()`设置的数据添加请求参数上
   */
  public async get<T = any>(): Promise<GetRes<T>> {
    if (this._withs?.length) {
      return await this.internalMerge()
    } else {
      return await this.internalGet()
    }
  }

  /**
   * 发起请求获取一个文档
   * @param options 
   * @returns 
   */
  public async getOne<T = any>(): Promise<GetOneRes<T>> {
    const res = await this.limit(1).get<T>()
    if (res.error) {
      return res as any
    }

    if (!res.data.length) {
      return {
        ok: true,
        data: null,
        requestId: res.requestId
      }
    }

    return {
      ok: true,
      data: res.data[0],
      requestId: res.requestId
    }
  }

  /**
   * [该接口已废弃，直接使用 `get()` 代替]
   * 发起请求获取文档列表，当使用 with 条件时使用
   * 
   * @deprecated 
   * 
   * 1. 调用 get() 执行主查询
   * 2. 结合主查询的结果，使用 in 执行子表查询
   * 3. 合并主表 & 子表的结果，即聚合
   * 4. intersection 可指定是否取两个结果集的交集，缺省则以主表结果为主
   */
  public async merge<T = any>(options?: { intersection?: boolean }): Promise<GetRes<T>> {
    const res = await this.internalMerge(options)
    return res
  }

  /**
   * 获取总数
   */
  public async count(): Promise<CountRes> {
    const param = this.buildQueryParam()
    const res = await this.send(ActionType.count, param)

    if (res.error) {
      return {
        requestId: res.requestId,
        ok: false,
        error: res.error,
        total: undefined,
        code: res.code
      }
    }

    return {
      requestId: res.requestId,
      total: res.data.total,
      ok: true
    }
  }

  /**
   * 发起请求批量更新文档
   *
   * @param data 数据
   */
  public async update(data: Object, options?: { multi?: boolean, merge?: boolean, upsert?: boolean }): Promise<UpdateRes> {

    if (!data || typeof data !== 'object' || 0 === Object.keys(data)?.length) {
      throw new Error('data cannot be empty object')
    }

    if (data.hasOwnProperty('_id')) {
      throw new Error('can not update the `_id` field')
    }

    const param = this.buildQueryParam()
    param.multi = options?.multi ?? false
    param.merge = options?.merge ?? true
    param.upsert = options?.upsert ?? false
    if (param.merge) {
      param.data = UpdateSerializer.encode(data)
    } else {
      param.data = serialize(data)
    }

    const res = await this.send(ActionType.update, param)
    if (res.error) {
      return {
        requestId: res.requestId,
        error: res.error,
        ok: false,
        code: res.code,
        updated: undefined,
        matched: undefined,
        upsertId: undefined
      }
    }

    return {
      requestId: res.requestId,
      updated: res.data.updated,
      matched: res.data.matched,
      upsertId: res.data.upsert_id,
      ok: true
    }
  }

  /**
   * 条件删除文档
   */
  public async remove(options?: { multi: boolean }): Promise<RemoveRes> {
    if (Object.keys(this._queryOptions).length > 0) {
      console.warn('`offset`, `limit` and `projection` are not supported in remove() operation')
    }

    if (this._fieldOrders?.length > 0) {
      console.warn('`orderBy` is not supported in remove() operation')
    }

    const param = this.buildQueryParam()
    param.multi = options?.multi ?? false

    const res = await this.send(ActionType.remove, param)
    if (res.error) {
      return {
        requestId: res.requestId,
        error: res.error,
        ok: false,
        deleted: undefined,
        code: res.code
      }
    }

    return {
      requestId: res.requestId,
      deleted: res.data.deleted,
      ok: true
    }
  }

  /**
   * Build query param
   * @returns 
   */
  protected buildQueryParam() {
    const param: QueryParam = {
      collectionName: this._coll,
    }
    if (this._fieldFilters) {
      param.query = this._fieldFilters
    }
    if (this._fieldOrders?.length) {
      param.order = [...this._fieldOrders]
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
    if (this._queryOptions.count) {
      param.count = this._queryOptions.count
    }

    return param
  }

  /**
  * 发起请求获取文档列表
  */
  protected async internalGet<T = any>(): Promise<GetRes<T>> {
    const param = this.buildQueryParam()
    const res = await this.send(ActionType.query, param)
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
    if (res.total) result.total = res.data?.total
    if (res.limit) result.limit = res.data?.limit
    if (res.offset) result.offset = res.data?.offset
    return result
  }

  /**
   * 发起请求获取文档列表，当使用 with 条件时使用
   * 
   * 1. 调用 internalGet() 执行主查询
   * 2. 结合主查询的结果，使用 in 执行子表查询
   * 3. 合并主表 & 子表的结果，即聚合
   * 4. intersection 可指定是否取两个结果集的交集，缺省则以主表结果为主
   */
  protected async internalMerge<T = any>(options?: { intersection?: boolean }): Promise<GetRes<T>> {

    options = options ?? {} as any
    const intersection = options?.intersection ?? false

    // 调用 get() 执行主查询
    const res = await this.internalGet()
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
   * Send query request
   * @param action 
   * @param param 
   * @returns 
   */
  public async send(action: ActionType, param: QueryParam) {
    return await this._request.send(action, param)
  }
}
