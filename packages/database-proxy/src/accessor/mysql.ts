import { AccessorInterface, ReadResult, UpdateResult, AddResult, RemoveResult, CountResult } from "./accessor"
import { Params, ActionType } from '../types'
import { createPool, Pool, ResultSetHeader, OkPacket, RowDataPacket } from 'mysql2/promise'
import { ConnectionOptions } from 'mysql2'
import { SqlBuilder } from "./sql_builder"
import { DefaultLogger } from ".."
import { LoggerInterface } from "../logger"
import { EventEmitter } from "events"

/**
 * Mysql Accessor
 */
export class MysqlAccessor implements AccessorInterface {

    readonly type: string = 'mysql'
    readonly db_name: string
    readonly options: ConnectionOptions
    readonly pool: Pool
    private _logger: LoggerInterface
    readonly _event = new EventEmitter()

    get logger() {
        if (!this._logger) {
            this._logger = new DefaultLogger()
        }
        return this._logger
    }

    setLogger(logger: LoggerInterface) {
        this._logger = logger
    }

    get conn(): Pool {
        return this.pool
    }

    constructor(options?: ConnectionOptions) {
        this.db_name = options.database
        this.options = options
        this.pool = createPool(options)
        this.logger.info(`mysql accessor init`)
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
        await this.conn.end()
        this.logger.info('mysql connection closed')
    }

    async execute(params: Params): Promise<ReadResult | UpdateResult | AddResult | RemoveResult | CountResult | never> {
        const { collection, action } = params

        this.logger.info(`mysql start executing {${collection}}: ` + JSON.stringify(params))

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

        const error = `invalid 'action': ${action}`
        this.logger.error(`mysql end of executing occurred:` + error)
        throw new Error(error)
    }

    async get(collection: string, query: any): Promise<any> {
        const params: Params = {
            collection: collection,
            action: ActionType.READ,
            query: query,
            limit: 1
        }
        const { sql, values } = SqlBuilder.from(params).select()
        const [rows] = await this.conn.execute(sql, values)
        return (rows as []).length ? rows[0] : null
    }

    protected async read(_collection: string, params: Params): Promise<ReadResult> {
        const { collection } = params
        const { sql, values } = SqlBuilder.from(params).select()

        const nestTables = params.nested ?? false

        this.logger.debug(`mysql read {${collection}}: `, { sql, values })
        const [rows] = await this.conn.execute<RowDataPacket[]>({ sql, values, nestTables })
        return {
            list: rows
        }
    }

    protected async update(_collection: string, params: Params): Promise<UpdateResult> {
        const { collection } = params

        const { sql, values } = SqlBuilder.from(params).update()

        this.logger.debug(`mysql update {${collection}}: `, { sql, values })
        const [ret] = await this.conn.execute<ResultSetHeader>(sql, values)

        return {
            updated: ret.affectedRows,
            matched: ret.affectedRows,
            upsert_id: undefined
        }
    }

    protected async add(_collection: string, params: Params): Promise<AddResult> {
        let { multi, collection } = params

        if (multi) {
            console.warn('mysql add(): {multi == true} has been ignored!')
        }

        const { sql, values } = SqlBuilder.from(params).insert()

        this.logger.debug(`mysql add {${collection}}: `, { sql, values })
        const [ret] = await this.conn.execute<ResultSetHeader>(sql, values)

        return {
            _id: ret.insertId as any,
            insertedCount: ret.affectedRows
        }
    }

    protected async remove(_collection: string, params: Params): Promise<RemoveResult> {
        const { collection } = params

        const { sql, values } = SqlBuilder.from(params).delete()
        this.logger.debug(`mysql remove {${collection}}: `, { sql, values })

        const [ret] = await this.conn.execute<OkPacket>(sql, values)
        return {
            deleted: ret.affectedRows
        }
    }

    protected async count(_collection: string, params: Params): Promise<CountResult> {
        const { collection } = params

        const { sql, values } = SqlBuilder.from(params).count()

        this.logger.debug(`mysql count {${collection}}: `, { sql, values })
        const [ret] = await this.conn.execute<RowDataPacket[]>(sql, values)

        if (ret.length === 0) {
            return { total: 0 }
        }
        return {
            total: ret[0].total
        }
    }
}