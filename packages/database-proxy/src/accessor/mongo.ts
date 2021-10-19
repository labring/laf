import { AccessorInterface, ReadResult, UpdateResult, AddResult, RemoveResult, CountResult } from "./accessor"
import { Params, ActionType, Order, Direction } from '../types'
import { MongoClient, ObjectId, MongoClientOptions, Db, UpdateOptions, Filter } from 'mongodb'
import * as mongodb from 'mongodb'
import { DefaultLogger, LoggerInterface } from "../logger"
import { EventEmitter } from "events"
import { EJSON } from "bson"
import { AggregateStage } from "database-ql/dist/commonjs/interface"

/**
 * Mongodb Accessor 负责执行 mongodb 数据操作
 * 
 * 连接参数同 mongodb nodejs driver，参考以下链接：
 * @see https://docs.mongodb.com/manual/reference/connection-string/
 * 
 * 实例化本对象后，须调用 `init()` 待数据库连接成功，方可执行数据操作。
 * ```js
 *  const accessor = new MongoAccessor('dbname', 'mongodb://localhost:27017', { directConnection: true })
 * 
 *  accessor.init()
 * ```
 * 
 * 可通过 `ready` 属性等待数据库连接就绪，该属性为 `Promise` 对象：
 * ```js
 *  accessor.ready.then(() => { 
 *      // 连接就绪，可进行数据操作
 *  })
 * ```
 */
export class MongoAccessor implements AccessorInterface {

    readonly type: string = 'mongo'

    /**
     * 数据库名
     */
    readonly db_name: string
    readonly conn: MongoClient
    protected _event = new EventEmitter()

    /**
     * `ready` 属性可用于等待数据库连接就绪，该属性为 `Promise` 对象：
     * ```js
     *  accessor.ready.then(() => { 
     *      // 连接就绪，可进行数据操作
     *  })
     * ```
     */
    ready: Promise<MongoClient>

    db: Db

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

    /**
     * Mongodb Accessor 负责执行 mongodb 数据操作
     * 
     * 连接参数同 mongodb nodejs driver，参考以下链接：
     * @see https://docs.mongodb.com/manual/reference/connection-string/
     * 
     * 实例化本对象后，须调用 `init()` 待数据库连接成功，方可执行数据操作。
     * ```js
     *  const accessor = new MongoAccessor('dbname', 'mongodb://localhost:27017', { directConnection: true })
     * 
     *  accessor.init()
     * ```
     * 
     * 可通过 `ready` 属性等待数据库连接就绪，该属性为 `Promise` 对象：
     * ```js
     *  accessor.ready.then(() => { 
     *      // 连接就绪，可进行数据操作
     *  })
     * ```
     */
    constructor(db: string, url: string, options?: MongoClientOptions) {
        this.db_name = db
        this.conn = new MongoClient(url, options || {})
        this.db = null
        // 初始化为空 Promise，永远不被 resolved
        this.ready = new Promise(() => { /* nop */ })
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

    /**
     * 初始化实例: 执行数据库连接
     * @returns Promise<MongoClient>
     */
    async init() {
        this.logger.info(`mongo accessor connecting...`)
        this.ready = this.conn
            .connect()
            .then(ret => {
                this.logger.info(`mongo accessor connected, db: ` + this.db_name)
                this.db = this.conn.db(this.db_name)
                return ret
            })

        return await this.ready
    }

    /**
     * 关闭连接
     */
    async close() {
        await this.conn.close()
        this.logger.info('mongo connection closed')
    }

    /**
     * 执行数据请求
     * @param params 数据请求参数
     * @returns 
     */
    async execute(params: Params): Promise<ReadResult | UpdateResult | AddResult | RemoveResult | CountResult | never> {
        const { collection, action } = params

        this.logger.info(`mongo start executing {${collection}}: ` + JSON.stringify(params))

        if (action === ActionType.READ) {
            return await this.read(collection, params)
        }

        if (action === ActionType.AGGREGATE) {
            return await this.aggregate(collection, params)
        }

        if (action === ActionType.UPDATE) {
            return await this.update(collection, params)
        }

        if (action === ActionType.ADD) {
            return await this.add(collection, params)
        }

        if (action === ActionType.REMOVE) {
            return await this.remove(collection, params)
        }

        if (action === ActionType.COUNT) {
            return await this.count(collection, params)
        }

        const error = new Error(`invalid 'action': ${action}`)
        this.logger.error(`mongo end of executing occurred error: `, error)
        throw error
    }

    /**
     * 查询单个文档，主要用于 `访问规则` 中的数据查询
     */
    async get(collection: string, query: Filter<any>): Promise<any> {
        const coll = this.db.collection(collection)
        return await coll.findOne(query)
    }

    /**
     * 触发查询结果事件
     * @param params 
     * @param data 
     */
    protected emitResult(params: Params, result: any) {
        this.emit('result', { params, result })
    }

    /**
     * 执行查询文档操作
     * @param collection 集合名
     * @param params 请求参数
     * @returns 查询结果
     */
    protected async read(collection: string, params: Params): Promise<ReadResult> {
        const coll = this.db.collection(collection)

        const { order, offset, limit, projection, count } = params
        const query: any = this.deserializedEjson(params.query || {})

        const options: any = {
            limit: 100,
            skip: 0
        }

        if (order) options.sort = this.processOrder(order)
        if (offset) options.skip = offset
        if (projection) options.projection = projection

        if (limit) {
            options.limit = limit
        }

        this.logger.debug(`mongo before read {${collection}}: `, { query, options })
        const data = await coll.find(query, options).toArray()
        this.logger.debug(`mongo end of read {${collection}}: `, { query, options, dataLength: data.length })

        let total: number
        if (count) {
            total = await coll.countDocuments(query as Filter<any>)
        }

        this.emitResult(params, { data })
        const serialized = data.map(doc => this.serializeBson(doc))
        return { list: serialized, limit: options.limit, offset: options.skip, total }
    }

    /**
     * Execute aggregate query
     * @param collection 
     * @param params 
     * @returns 
     */
    protected async aggregate(collection: string, params: Params): Promise<ReadResult> {
        const coll = this.db.collection(collection)
        const stages = this.processAggregateStages(params.stages)

        this.logger.debug(`mongo before aggregate {${collection}}: `, stages)
        const data = await coll.aggregate(stages).toArray()
        this.logger.debug(`mongo after aggregate {${collection}}: `, stages, { dataLength: data.length })

        this.emitResult(params, { data })
        const serialized = data.map(doc => this.serializeBson(doc))
        return { list: serialized }
    }

    /**
     * Execute update query
     * @param collection Collection name
     * @param params 
     * @returns 
     */
    protected async update(collection: string, params: Params): Promise<UpdateResult> {
        const coll = this.db.collection(collection)

        let { query, data, multi, upsert, merge } = params

        query = this.deserializedEjson(query || {})
        data = this.deserializedEjson(data || {})

        let options: UpdateOptions = {}
        if (upsert) options.upsert = upsert

        // merge 不为 true 代表替换操作，暂只允许单条替换
        if (!merge) {
            this.logger.debug(`mongo before update (replaceOne) {${collection}}: `, { query, data, options, merge, multi })
            const result: any = await coll.replaceOne(query, data, options)
            const _data = {
                upsert_id: result.upsertedId,
                updated: result.modifiedCount,
                matched: result.matchedCount
            }
            this.emitResult(params, _data)
            return _data
        }

        let result: mongodb.UpdateResult

        // multi 表示更新一条或多条
        if (!multi) {
            this.logger.debug(`mongo before update (updateOne) {${collection}}: `, { query, data, options, merge, multi })
            result = await coll.updateOne(query, data, options)
        } else {
            options.upsert = false
            this.logger.debug(`mongo before update (updateMany) {${collection}}: `, { query, data, options, merge, multi })
            result = await coll.updateMany(query, data, options) as mongodb.UpdateResult
        }

        const ret: UpdateResult = {
            upsert_id: this.serializeBson(result.upsertedId) as any,
            updated: result.modifiedCount,
            matched: result.matchedCount
        }

        this.emitResult(params, ret)
        this.logger.debug(`mongo end of update {${collection}}: `, { query, data, options, merge, multi, result: ret })
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
            data.forEach((ele: any) => ele._id = this.generateDocId())
            result = await coll.insertMany(data)
        }

        const ret: AddResult = {
            _id: this.serializeBson((result as mongodb.InsertManyResult).insertedIds || (result as mongodb.InsertOneResult).insertedId) as any,
            insertedCount: (result as mongodb.InsertManyResult).insertedCount
        }

        this.emitResult(params, ret)
        this.logger.debug(`mongo end of add {${collection}}: `, { data, multi, result: ret })
        return ret
    }

    /**
     * 执行删除文档操作
     * @param collection 集合名
     * @param params 请求参数
     * @returns 执行结果
     */
    protected async remove(collection: string, params: Params): Promise<RemoveResult> {
        const coll = this.db.collection(collection)
        let { query, multi } = params
        query = this.deserializedEjson(query || {})

        let result: any
        this.logger.debug(`mongo before remove {${collection}}: `, { query, multi })

        // multi 表示单条或多条删除
        if (!multi) {
            result = await coll.deleteOne(query)
        } else {
            result = await coll.deleteMany(query)
        }

        const ret = {
            deleted: result.deletedCount
        }

        this.emitResult(params, ret)
        this.logger.debug(`mongo end of remove {${collection}}: `, ret)
        return ret
    }

    /**
     * 执行文档计数操作
     * @param collection 集合名
     * @param params 请求参数
     * @returns 执行结果
     */
    protected async count(collection: string, params: Params): Promise<CountResult> {
        const coll = this.db.collection(collection)

        const query = this.deserializedEjson(params.query || {}) as any
        const options = {}

        this.logger.debug(`mongo before count {${collection}}: `, { query })
        const result = await coll.countDocuments(query, options)
        this.logger.debug(`mongo end of count {${collection}}: `, { query, result })

        this.emitResult(params, result)
        return {
            total: result
        }
    }

    /**
     * Convert order params to Mongodb's order format
     * @param order 
     * @returns 
     */
    protected processOrder(order: Order[]) {
        if (!(order instanceof Array))
            return undefined

        return order.map(o => {
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
        const _stages = stages.map(item => {
            const key = item.stageKey
            const value = EJSON.parse(item.stageValue, { relaxed: true })
            return { [key]: value }
        })
        return _stages
    }
}