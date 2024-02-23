import {
  AccessorInterface,
  ReadResult,
  UpdateResult,
  AddResult,
  RemoveResult,
  CountResult,
  ListIndexesResult,
  DropIndexResult,
  CreateIndexResult,
} from './accessor'
import { Params, ActionType, Order, Direction } from '../types'
import { MongoClient, ObjectId, UpdateOptions, Filter } from 'mongodb'
import * as mongodb from 'mongodb'
import { DefaultLogger, LoggerInterface } from '../logger'
import { EventEmitter } from 'events'
import { EJSON } from 'bson'
import { AggregateStage } from 'database-ql/dist/commonjs/interface'

/**
 * Mongodb Accessor is responsible for performing MongoDB data operations.
 */
export class MongoAccessor implements AccessorInterface {
  readonly type = 'mongo'

  readonly client: MongoClient
  protected _event = new EventEmitter()

  get db() {
    return this.client.db()
  }

  private _logger: LoggerInterface

  get logger() {
    if (!this._logger) {
      this._logger = new DefaultLogger()
    }
    return this._logger
  }

  setLogger(logger: LoggerInterface) {
    this._logger = logger
  }

  constructor(client: MongoClient) {
    this.client = client
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    return this._event.emit(event, ...args)
  }

  once(event: string | symbol, listener: (...args: any[]) => void): void {
    this.once(event, listener)
  }

  removeAllListeners(event?: string | symbol): void {
    this._event.removeAllListeners(event)
  }

  on(event: string | symbol, listener: (...args: any[]) => void): void {
    this._event.on(event, listener)
  }

  off(event: string | symbol, listener: (...args: any[]) => void): void {
    this._event.off(event, listener)
  }

  async close() {
    await this.client.close()
    this.logger.info('mongo connection closed')
  }

  async execute(
    params: Params
  ): Promise<
    | ReadResult
    | UpdateResult
    | AddResult
    | RemoveResult
    | CountResult
    | CreateIndexResult
    | DropIndexResult
    | ListIndexesResult
    | never
  > {
    const { collection, action } = params

    this.logger.info(
      `mongo start executing {${collection}}: ` + JSON.stringify(params)
    )

    switch (action) {
      case ActionType.READ:
        return await this.read(collection, params)
      case ActionType.UPDATE:
        return await this.update(collection, params)
      case ActionType.AGGREGATE:
        return await this.aggregate(collection, params)
      case ActionType.REMOVE:
        return await this.remove(collection, params)
      case ActionType.ADD:
        return await this.add(collection, params)
      case ActionType.COUNT:
        return await this.count(collection, params)
      case ActionType.CREATE_INDEX:
        return await this.createIndex(collection, params)
      case ActionType.CREATE_INDEX:
        return await this.createIndex(collection, params)
      case ActionType.DROP_INDEX:
        return await this.dropIndex(collection, params)
      case ActionType.LIST_INDEXES:
        return await this.listIndexes(collection, params)
    }

    const error = new Error(`invalid 'action': ${action}`)
    this.logger.error(`mongo end of executing occurred error: `, error)
    throw error
  }

  /**
   * Query a single document, mainly used for data queries in `access rules`
   */
  async get(collection: string, query: Filter<any>): Promise<any> {
    const coll = this.db.collection(collection)
    return await coll.findOne(query)
  }

  /**
   * Emit result event
   * @param params
   * @param data
   */
  protected emitResult(params: Params, result: any) {
    this.emit('result', { params, result })
  }

  /**
   * Execute read query
   * @param collection collection name
   * @param params query params
   * @returns
   */
  protected async read(
    collection: string,
    params: Params
  ): Promise<ReadResult> {
    const coll = this.db.collection(collection)

    const { order, offset, limit, projection, count } = params
    const query: any = this.deserializedEjson(params.query || {})

    const options: any = {
      limit: 100,
      skip: 0,
    }

    if (order) options.sort = this.processOrder(order)
    if (offset) options.skip = offset
    if (projection) options.projection = projection

    if (limit) {
      options.limit = limit
    }

    this.logger.debug(`mongo before read {${collection}}: `, { query, options })
    const data = await coll.find(query, options).toArray()
    this.logger.debug(`mongo end of read {${collection}}: `, {
      query,
      options,
      dataLength: data.length,
    })

    let total: number
    if (count) {
      total = await coll.countDocuments(query as Filter<any>)
    }

    this.emitResult(params, { data })
    const serialized = data.map((doc) => this.serializeBson(doc))
    return {
      list: serialized,
      limit: options.limit,
      offset: options.skip,
      total,
    }
  }

  /**
   * Execute aggregate query
   * @param collection
   * @param params
   * @returns
   */
  protected async aggregate(
    collection: string,
    params: Params
  ): Promise<ReadResult> {
    const coll = this.db.collection(collection)
    const stages = this.processAggregateStages(params.stages)

    this.logger.debug(`mongo before aggregate {${collection}}: `, stages)
    const data = await coll.aggregate(stages).toArray()
    this.logger.debug(`mongo after aggregate {${collection}}: `, stages, {
      dataLength: data.length,
    })

    this.emitResult(params, { data })
    const serialized = data.map((doc) => this.serializeBson(doc))
    return { list: serialized }
  }

  /**
   * Execute update query
   * @param collection Collection name
   * @param params
   * @returns
   */
  protected async update(
    collection: string,
    params: Params
  ): Promise<UpdateResult> {
    const coll = this.db.collection(collection)

    let { query, data, multi, upsert, merge } = params

    query = this.deserializedEjson(query || {})
    data = this.deserializedEjson(data || {})

    const options: UpdateOptions = {}
    if (upsert) options.upsert = upsert

    // merge 不为 true 代表替换操作，暂只允许单条替换
    if (!merge) {
      this.logger.debug(`mongo before update (replaceOne) {${collection}}: `, {
        query,
        data,
        options,
        merge,
        multi,
      })
      const result: any = await coll.replaceOne(query, data, options)
      const _data = {
        upsert_id: result.upsertedId,
        updated: result.modifiedCount,
        matched: result.matchedCount,
      }
      this.emitResult(params, _data)
      return _data
    }

    let result: mongodb.UpdateResult

    // multi 表示更新一条或多条
    if (!multi) {
      this.logger.debug(`mongo before update (updateOne) {${collection}}: `, {
        query,
        data,
        options,
        merge,
        multi,
      })
      result = await coll.updateOne(query, data, options)
    } else {
      options.upsert = false
      this.logger.debug(`mongo before update (updateMany) {${collection}}: `, {
        query,
        data,
        options,
        merge,
        multi,
      })
      result = (await coll.updateMany(
        query,
        data,
        options
      )) as mongodb.UpdateResult
    }

    const ret: UpdateResult = {
      upsert_id: this.serializeBson(result.upsertedId) as any,
      updated: result.modifiedCount,
      matched: result.matchedCount,
    }

    this.emitResult(params, ret)
    this.logger.debug(`mongo end of update {${collection}}: `, {
      query,
      data,
      options,
      merge,
      multi,
      result: ret,
    })
    return ret
  }

  /**
   * Execute insert query
   * @param collection Collection name
   * @param params
   * @returns
   */
  protected async add(collection: string, params: Params): Promise<AddResult> {
    const coll = this.db.collection(collection)
    let { data, multi } = params
    data = this.deserializedEjson(data || {})

    let result: mongodb.InsertOneResult | mongodb.InsertManyResult
    this.logger.debug(`mongo before add {${collection}}: `, { data, multi })

    // multi 表示单条或多条添加
    if (!multi) {
      data._id = this.generateDocId()
      result = await coll.insertOne(data)
    } else {
      data = data instanceof Array ? data : [data]
      data.forEach((ele: any) => (ele._id = this.generateDocId()))
      result = await coll.insertMany(data)
    }

    const ids =
      (result as mongodb.InsertManyResult).insertedIds ||
      (result as mongodb.InsertOneResult).insertedId

    const ret: AddResult = {
      _id: this.serializeBson(ids) as any,
      insertedCount: (result as mongodb.InsertManyResult).insertedCount,
    }

    this.emitResult(params, ret)
    this.logger.debug(`mongo end of add {${collection}}: `, {
      data,
      multi,
      result: ret,
    })
    return ret
  }

  /**
   * Execute remove query
   * @param collection 集合名
   * @param params 请求参数
   * @returns 执行结果
   */
  protected async remove(
    collection: string,
    params: Params
  ): Promise<RemoveResult> {
    const coll = this.db.collection(collection)
    let { query, multi } = params
    query = this.deserializedEjson(query || {})

    let result: any
    this.logger.debug(`mongo before remove {${collection}}: `, { query, multi })

    // multi means delete one or more
    if (!multi) {
      result = await coll.deleteOne(query)
    } else {
      result = await coll.deleteMany(query)
    }

    const ret = {
      deleted: result.deletedCount,
    }

    this.emitResult(params, ret)
    this.logger.debug(`mongo end of remove {${collection}}: `, ret)
    return ret
  }

  /**
   * Execute count query
   * @param collection collection name
   * @param params query params
   * @returns
   */
  protected async count(
    collection: string,
    params: Params
  ): Promise<CountResult> {
    const coll = this.db.collection(collection)

    const query = this.deserializedEjson(params.query || {}) as any
    const options = {}

    this.logger.debug(`mongo before count {${collection}}: `, { query })
    const result = await coll.countDocuments(query, options)
    this.logger.debug(`mongo end of count {${collection}}: `, { query, result })

    this.emitResult(params, result)
    return {
      total: result,
    }
  }

  /**
   * Convert order params to Mongodb's order format
   * @param order
   * @returns
   */
  protected processOrder(order: Order[]) {
    if (!(order instanceof Array)) return undefined

    return order.map((o) => {
      const dir = o.direction === Direction.DESC ? -1 : 1
      return [o.field, dir]
    })
  }

  /**
   * Generate a hex string document id
   * @returns
   */
  protected generateDocId(): string {
    const id = new ObjectId()
    return id.toHexString()
  }

  /**
   * Serialize Bson to Extended JSON
   * @see https://docs.mongodb.com/manual/reference/mongodb-extended-json/
   * @param bsonDoc
   * @returns
   */
  protected serializeBson(bsonDoc: any) {
    return EJSON.serialize(bsonDoc, { relaxed: true })
  }

  /**
   * Deserialize Extended JSOn to Bson
   * @see https://docs.mongodb.com/manual/reference/mongodb-extended-json/
   * @param ejsonDoc
   * @returns
   */
  protected deserializedEjson(ejsonDoc: any) {
    return EJSON.deserialize(ejsonDoc, { relaxed: true })
  }

  /**
   * Convert aggregate stages params to Mongodb aggregate pipelines
   * @param stages
   * @returns
   */
  protected processAggregateStages(stages: AggregateStage[]) {
    const _stages = stages.map((item) => {
      const key = item.stageKey
      const value = EJSON.parse(item.stageValue, { relaxed: true })
      return { [key]: value }
    })
    return _stages
  }

  /**
   * Execute create index query
   * @param collection Collection name
   * @param params
   * @returns
   */
  protected async createIndex(
    collection: string,
    params: Params
  ): Promise<CreateIndexResult> {
    const coll = this.db.collection(collection)
    let { data } = params
    data = this.deserializedEjson(data || {})

    const { keys, options } = data

    this.logger.debug(`mongo before creating index {${collection}}: `, { data })

    const result = await coll.createIndex(
      keys as mongodb.IndexSpecification,
      options as mongodb.CreateIndexesOptions
    )

    const ret: CreateIndexResult = {
      indexName: result,
    }

    this.emitResult(params, ret)
    this.logger.debug(`mongo end of creating index {${collection}}: `, {
      data,
      result: ret,
    })
    return ret
  }

  /**
   * Execute drop index query
   * @param collection Collection name
   * @param params
   * @returns
   */
  protected async dropIndex(
    collection: string,
    params: Params
  ): Promise<DropIndexResult> {
    const coll = this.db.collection(collection)
    let { data } = params
    data = this.deserializedEjson(data || {})

    this.logger.debug(`mongo before drop index {${collection}}: `, { data })

    const result = await coll.dropIndex(data)

    const ret: DropIndexResult = {
      result,
    }

    this.emitResult(params, ret)
    this.logger.debug(`mongo end of drop index {${collection}}: `, {
      data,
      result: ret,
    })
    return ret
  }

  /**
   * Execute list indexes query
   * @param collection Collection name
   * @param params
   * @returns
   */
  protected async listIndexes(
    collection: string,
    params: Params
  ): Promise<ListIndexesResult> {
    const coll = this.db.collection(collection)
    let { data } = params
    data = this.deserializedEjson(data || {})

    this.logger.debug(`mongo before listing indexes {${collection}}: `, {
      data,
    })

    const result = await coll.listIndexes(data).toArray()

    this.logger.debug(`mongo end of listing indexes {${collection}}: `, {
      data,
    })

    this.emitResult(params, { result })
    const serialized = result.map((doc) => this.serializeBson(doc))
    return { list: serialized }
  }
}
