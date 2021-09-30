import { AccessorInterface, ReadResult, UpdateResult, AddResult, RemoveResult, CountResult } from "./accessor"
import { Params, ActionType } from '../types'
import { DefaultLogger } from ".."
import { LoggerInterface } from "../logger"


declare const uniCloud: any

export class UniCloudAccessor implements AccessorInterface {

    protected db: any
    readonly type: string = 'tcloud'
    /**
     * @see https://mongodb.github.io/node-mongodb-native/3.3/reference/connecting/connection-settings/
     */
    constructor() {
        this.db = uniCloud.database()
    }
    on(_event: string | symbol, _listener: (...args: any[]) => void): void {
        throw new Error("Method not implemented.")
    }
    off(_event: string | symbol, _listener: (...args: any[]) => void): void {
        throw new Error("Method not implemented.")
    }
    emit(_event: string | symbol, ..._args: any[]): boolean {
        throw new Error("Method not implemented.")
    }
    once(_event: string | symbol, _listener: (...args: any[]) => void): void {
        throw new Error("Method not implemented.")
    }
    removeAllListeners(_event?: string | symbol): void {
        throw new Error("Method not implemented.")
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

    close() {
    }

    async execute(params: Params): Promise<ReadResult | UpdateResult | AddResult | RemoveResult | CountResult | never> {
        const { collection, action } = params

        if (action === ActionType.READ) {
            return await this.read(collection, params)
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

        throw new Error(`invalid 'action': ${action}`)
    }

    async get(collection: string, query: any): Promise<any> {
        const coll = this.db.collection(collection)
        const res = await coll.where(query).get()
        if (res.data.length)
            return res.data[0]
        return null
    }

    protected async read(collection: string, params: Params): Promise<ReadResult> {
        const coll = this.db.collection(collection)

        let { query, order, offset, limit, projection } = params
        query = query || {}
        let req = coll.where(query)

        // calling concat
        const ordrs = order || []
        ordrs.forEach((ord) => req = req.orderBy(ord.field, ord.direction))
        if (offset) req = req.skip(offset)
        if (projection) req = req.field(projection)
        if (limit) {
            req = req.limit(limit > 100 ? 100 : limit)
        }

        const res = await req.get(query)
        return { list: res.data }
    }

    protected async update(collection: string, params: Params): Promise<UpdateResult> {
        const coll = this.db.collection(collection)

        let { query, merge, data, multi } = params

        // dispatch calling function
        let result: any
        if (!merge) {
            result = await coll.doc(query._id).set(data)
        } else if (merge && multi) {
            result = await coll.where(query).update(data)
        } else {
            result = await coll.doc(query._id).update(data)
        }

        return {
            upsert_id: result.upsertedId,
            updated: result.updated,
            matched: result.affectedDocs
        }
    }

    protected async add(collection: string, params: Params): Promise<AddResult> {
        const coll = this.db.collection(collection)
        let { data } = params

        const result = await coll.add(data)

        return {
            _id: result.result || result.id,
            insertedCount: result.inserted
        }
    }

    protected async remove(collection: string, params: Params): Promise<RemoveResult> {
        const coll = this.db.collection(collection)
        let { query, multi } = params
        query = query || {}
        let result: any
        if (!multi) {
            result = await coll.doc(query._id).remove()
        } else {
            result = await coll.where(query).remove()
        }

        return {
            deleted: result.deleted
        }
    }

    protected async count(collection: string, params: Params): Promise<CountResult> {
        const coll = this.db.collection(collection)

        const query = params.query || {}
        const result = await coll.where(query).count()

        return {
            total: result.total
        }
    }
}