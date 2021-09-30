import assert = require("assert")
import { Direction, JoinParam, JoinType, LOGIC_COMMANDS, Order, Params, QUERY_COMMANDS, UPDATE_COMMANDS } from "../types"


/**
 *  SqlBuilder: Mongo 操作语法生成 SQL 语句
 */
export class SqlBuilder {
    readonly params: Params
    private _values: any[] = []

    constructor(params: Params) {
        this._values = []
        this.params = params
    }

    static from(params: Params): SqlBuilder {
        return new SqlBuilder(params)
    }

    get table(): string {
        return this.params.collection
    }

    get query(): any {
        return this.params.query || {}
    }

    get projection(): any {
        return this.params.projection || {}
    }

    get orders(): Order[] {
        return this.params.order || []
    }

    get data(): any {
        return this.params.data || {}
    }

    get joins(): JoinParam[] {
        return this.params.joins || []
    }

    select() {
        const fields = this.buildProjection()
        const joins = this.buildJoins()
        const query = this.buildQuery()
        const orderBy = this.buildOrder()
        const limit = this.buildLimit()

        const sql = `select ${fields} from ${this.table} ${joins}${query} ${orderBy} ${limit}`
        const values = this.values()
        return {
            sql,
            values
        }
    }

    update() {
        this.checkData()

        const data = this.buildUpdateData()
        const joins = this.buildJoins()
        const query = this.buildQuery()

        // 当 multi 为 true 时允许多条更新，反之则只允许更新一条数据
        // multi 默认为 false
        const multi = this.params.multi
        const limit = multi ? '' : `limit 1`
        const orderBy = this.buildOrder()

        const sql = `update ${this.table} ${data} ${joins}${query} ${orderBy} ${limit}`
        const values = this.values()

        return { sql, values }
    }

    delete() {
        const joins = this.buildJoins()
        const query = this.buildQuery()

        // 当 multi 为 true 时允许多条更新，反之则只允许更新一条数据
        const multi = this.params.multi
        const limit = multi ? '' : `limit 1`
        const orderBy = this.buildOrder()
        const sql = `delete from ${this.table} ${joins}${query} ${orderBy} ${limit} `
        const values = this.values()
        return {
            sql,
            values
        }
    }

    insert() {
        this.checkData()
        const data = this.buildInsertData()
        const sql = `insert into ${this.table} ${data}`
        const values = this.values()
        return { sql, values }
    }

    count() {
        const joins = this.buildJoins()
        const query = this.buildQuery()

        const sql = `select count(*) as total from ${this.table} ${joins}${query}`
        const values = this.values()
        return {
            sql,
            values
        }
    }

    protected addValues(values: any[]) {
        this._values.push(...values)
    }

    // 构建联表语句(join)
    protected buildJoins(): string {
        const joins = this.joins
        const leftTable = this.params.collection

        if (joins.length === 0) return ''
        const strs = []
        for (const join of joins) {
            const { collection, leftKey, rightKey, type } = join
            assert(this.checkJoinType(type), `invalid join type: ${type}`)
            this.checkField(collection)
            this.checkField(leftKey)
            this.checkField(rightKey)
            const rightTable = collection
            const str = `${type} join ${rightTable} on ${leftTable}.${leftKey} = ${rightTable}.${rightKey}`
            strs.push(str)
        }

        const ret = strs.join(' ')
        /**
        * 因为 join 功能是后加的， 空 joins 拼入 sql 后，会增加两
        * 这样会导致，原来的单元测试用例都无法通过的问题
        * 如果 joins 为空，那么就只插入空串，无空格即可
        */
        const wrapped_joins = ret == '' ? '' : ` ${ret} `
        return wrapped_joins
    }

    protected checkJoinType(joinType: string): boolean {
        const types: string[] = [JoinType.FULL, JoinType.INNER, JoinType.LEFT, JoinType.RIGHT]
        return types.includes(joinType)
    }

    // build query string
    protected buildQuery(): string {
        const builder = SqlQueryBuilder.from(this.query)
        const sql = builder.build()
        const values = builder.values()
        this.addValues(values)

        return sql
    }

    // build update data string: set x=a, y=b ...
    /**
     * 
     * ```js
     * {
     *   action: 'database.updateDocument',
     *   collection: 'categories',
     *   query: { _id: '6024f815acbf480fbb9648ce' },
     *   data: {
     *       '$set': { title: 'updated-title' },
     *       '$inc': { age: 1 },
     *       '$unset': { content: '' }
     *   },
     *   merge: true
     * }
     * ```
     */
    protected buildUpdateData(): string {
        let strs = []
        // sql 不支持 merge 为 false 的情况（合并更新，即替换）
        assert(this.params.merge, 'invalid params: {merge} should be true in sql')

        // $set
        if (this.data[UPDATE_COMMANDS.SET]) {
            const _data = this.data[UPDATE_COMMANDS.SET]
            assert(typeof _data === 'object', 'invalid data: value of $set must be object')
            for (const key in _data) {
                const _val = _data[key]
                assert(this.isBasicValue(_val), `invalid data: value of data only support BASIC VALUE(number|boolean|string|undefined|null), {${key}:${_val}} given`)
                this.addValues([_val])
                strs.push(`${key}=?`)
            }
        }

        // $inc
        if (this.data[UPDATE_COMMANDS.INC]) {
            const _data = this.data[UPDATE_COMMANDS.INC]
            assert(typeof _data === 'object', 'invalid data: value of $inc must be object')
            for (const key in _data) {
                const _val = _data[key]
                assert(typeof _val === 'number', `invalid data: value of $inc property only support number, {${key}:${_val}} given`)
                this.addValues([_val])
                strs.push(`${key}= ${key} + ?`)
            }
        }

        // $mul
        if (this.data[UPDATE_COMMANDS.MUL]) {
            const _data = this.data[UPDATE_COMMANDS.MUL]
            assert(typeof _data === 'object', 'invalid data: value of $mul must be object')
            for (const key in _data) {
                const _val = _data[key]
                assert(typeof _val === 'number', `invalid data: value of $mul property only support number, {${key}:${_val}} given`)
                this.addValues([_val])
                strs.push(`${key}= ${key} * ?`)
            }
        }

        // $unset
        if (this.data[UPDATE_COMMANDS.REMOVE]) {
            const _data = this.data[UPDATE_COMMANDS.REMOVE]
            assert(typeof _data === 'object', 'invalid data: value of $unset must be object')
            for (const key in _data) {
                strs.push(`${key}= null`)
            }
        }

        assert(strs.length, 'invalid data: set statement in sql is empty')

        return 'set ' + strs.join(',')
    }

    // build insert data string: (field1, field2) values (a, b, c) ...
    protected buildInsertData(): string {
        const fields = Object.keys(this.data)
        const values = fields.map(key => {
            const _val = this.data[key]
            assert(this.isBasicValue(_val), `invalid data: value of data only support BASIC VALUE(number|boolean|string|undefined|null), {${key}:${_val}} given`)
            this.addValues([_val])
            return '?'
        })

        const s_fields = fields.join(',')
        const s_values = values.join(',')

        return `(${s_fields}) values (${s_values})`
    }

    protected _buildData(): { fields: string[], values: any[] } {
        const fields = Object.keys(this.data)
        const values = fields.map(key => {
            const _val = this.data[key]
            assert(this.isBasicValue(_val), `invalid data: value of data only support BASIC VALUE(number|boolean|string|undefined|null), {${key}:${_val}} given`)
            return _val
        })

        return { fields, values }
    }

    protected buildOrder(): string {
        if (this.orders.length === 0) {
            return ''
        }
        const strs = this.orders.map(ord => {
            assert([Direction.ASC, Direction.DESC].includes(ord.direction), `invalid query: order value of {${ord.field}:${ord.direction}} MUST be 'desc' or 'asc'`)
            return `${ord.field} ${ord.direction}`
        })
        return 'order by ' + strs.join(',')
    }

    protected buildLimit(_limit?: number): string {
        const offset = this.params.offset || 0
        const limit = this.params.limit || _limit || 100
        assert(typeof offset === 'number', 'invalid query: offset must be number')
        assert(typeof limit === 'number', 'invalid query: limit must be number')

        return `limit ${offset},${limit}`
    }

    /**
     * 指定返回的字段
     * @tip 在 mongo 中可以指定只显示哪些字段 或者 不显示哪些字段，而在 SQL 中我们只支持[只显示哪些字段]
     * 示例数据:    `projection: { age: 1, f1: 1}`
     */
    protected buildProjection(): string {
        let fields = []
        for (const key in this.projection) {
            this.checkProjection(key)
            const value = this.projection[key]
            assert(value, `invalid query: value of projection MUST be {true} or {1}, {false} or {0} is not supported in sql`)
            fields.push(key)
        }
        if (fields.length === 0) {
            return '*'
        }
        return fields.join(',')
    }

    protected values(): any[] {
        return this._values || []
    }

    // 是否为值属性(number, string, boolean, undefine, null)
    protected isBasicValue(value) {
        if (value === null) {
            return true
        }
        const type = typeof value
        return ['number', 'string', 'boolean', 'undefined'].includes(type)
    }

    // data 不可为空
    protected checkData() {
        assert(this.data, `invalid data: data can NOT be ${this.data}`)
        assert(typeof this.data === 'object', `invalid data: data must be an object`)

        assert(!(this.data instanceof Array), `invalid data: data cannot be Array while using SQL`)

        const keys = Object.keys(this.data)
        keys.forEach(this.checkField)
        assert(keys.length, `invalid data: data can NOT be empty object`)
    }

    protected checkField(field_name: string) {
        if (SecurityCheck.checkField(field_name) === false)
            throw new Error(`invalid field : '${field_name}'`)
    }

    protected checkProjection(name: string) {
        if (SecurityCheck.checkProjection(name) === false) {
            throw new Error(`invalid projection field : '${name}'`)
        }
    }
}

/**
 * Mongo 查询转换为 SQL 查询
 */
export class SqlQueryBuilder {

    readonly query: any
    private _values: any[] = []  // SQL 参数化使用，收集SQL参数值

    constructor(query: any) {
        this.query = query
    }

    static from(query: any) {
        return new SqlQueryBuilder(query)
    }

    // 
    build(): string | null {
        assert(this.hasNestedFieldInQuery() === false, 'invalid query: nested property in query')

        let strs = ['where 1=1']
        // 遍历查询属性
        for (const key in this.query) {
            const v = this.buildOne(key, this.query[key])
            strs.push(v)
        }

        strs = strs.filter(s => s != '' && s != undefined)
        if (strs.length === 1) {
            return strs[0]
        }

        return strs.join(' and ')

    }

    values(): any[] {
        return this._values
    }

    // 处理一条查询属性（逻辑操作符属性、值属性、查询操作符属性）
    protected buildOne(key: string, value: any) {
        this.checkField(key)

        // 若是逻辑操作符
        if (this.isLogicOperator(key)) {
            return this.processLogicOperator(key, value)
        }

        // 若是值属性（number, string, boolean)
        if (this.isBasicValue(value)) {
            return this.processBasicValue(key, value, QUERY_COMMANDS.EQ)
        }

        // 若是查询操作符(QUERY_COMMANDS)
        if (typeof value === 'object') {
            return this.processQueryOperator(key, value)
        }

        throw new Error(`unknow query property found: {${key}: ${value}}`)
    }

    // 递归处理逻辑操作符的查询($and $or)
    /**
    ```js
        query = {
        f1: 0,
        '$or': [
            { f2: 1},
            { f6: { '$lt': 4000 } },
            {
            '$and': [ { f6: { '$gt': 6000 } }, { f6: { '$lt': 8000 } } ]
            }
        ]
        }
        // where 1=1 and f1 = 0 and (f2 = 1 and f6 < 4000 or (f6 > 6000 and f6 < 8000))
    ```
    */
    protected processLogicOperator(operator: string, value: any[]) {
        const that = this

        function _process(key: string, _value: any[] | any): string {
            // 如果是逻辑符，则 value 为数组遍历子元素
            if (that.isLogicOperator(key)) {
                assert(_value instanceof Array, `invalid query: value of logic operator must be array, but ${_value} given`)

                let result = []
                for (const item of _value) { // 逻辑符子项遍历
                    for (const k in item) { // 操作
                        const r = _process(k, item[k])
                        result.push(r)
                    }
                }
                // 将逻辑符中每个子项的结果用 逻辑符 连接起来
                const op = that.mapLogicOperator(key)
                const _v = result.join(` ${op} `)   // keep spaces in both ends
                return `(${_v})`  // 
            }

            // 若是值属性（number, string, boolean)
            if (that.isBasicValue(_value)) {
                return that.processBasicValue(key, _value, QUERY_COMMANDS.EQ)
            }

            // 若是查询操作符(QUERY_COMMANDS)
            if (typeof _value === 'object') {
                return that.processQueryOperator(key, _value)
            }
        }

        return _process(operator, value)
    }

    // 处理值属性
    protected processBasicValue(field: string, value: string | number | boolean | [], operator: string) {
        this.checkField(field)

        const op = this.mapQueryOperator(operator)

        let _v = null

        // $in $nin 值是数组, 需单独处理
        const { IN, NIN } = QUERY_COMMANDS
        if ([IN, NIN].includes(operator)) {
            (value as any[]).forEach(v => this.addValue(v))

            const arr = (value as any[]).map(_ => '?')
            const vals = arr.join(',')
            _v = `(${vals})`
        } else {
            assert(this.isBasicValue(value), `invalid query: typeof '${field}' must be number|string|boolean|undefined|null, but ${typeof value} given`)
            this.addValue(value)
            _v = '?'
        }

        return `${field} ${op} ${_v}`
    }

    // 处理查询操作符属性
    protected processQueryOperator(field: string, value: any) {
        let strs = []
        // key 就是查询操作符
        for (let key in value) {
            this.checkField(key)
            // @todo 暂且跳过[非]查询操作符，这种情况应该报错?
            if (!this.isQueryOperator(key)) {
                continue
            }

            const sub_value = value[key]
            const result = this.processBasicValue(field, sub_value, key)
            strs.push(result)
        }
        strs = strs.filter(s => s != '' && s != undefined)
        if (strs.length === 0) {
            return ''
        }
        return strs.join(' and ')
    }

    protected addValue(value: any) {
        this._values.push(value)
    }

    // 是否为值属性(number, string, boolean)
    protected isBasicValue(value) {
        const type = typeof value
        return ['number', 'string', 'boolean'].includes(type)
    }

    // 是否为逻辑操作符
    protected isLogicOperator(key: string) {
        const keys = Object.keys(LOGIC_COMMANDS)
            .map(k => LOGIC_COMMANDS[k])
        return keys.includes(key)
    }

    // 是否为查询操作符(QUERY_COMMANDS)
    protected isQueryOperator(key: string) {
        const keys = Object.keys(QUERY_COMMANDS)
            .map(k => QUERY_COMMANDS[k])
        return keys.includes(key)
    }

    // 是否为操作符
    protected isOperator(key: string) {
        return this.isLogicOperator(key) || this.isQueryOperator(key)
    }

    // 获取所有的查询操作符
    // @TODO not used
    protected getQueryOperators(): string[] {
        const logics = Object.keys(LOGIC_COMMANDS)
            .map(key => LOGIC_COMMANDS[key])
        const queries = Object.keys(QUERY_COMMANDS)
            .map(key => QUERY_COMMANDS[key])

        return [...logics, ...queries]
    }

    // 判断 Query 中是否有属性嵌套
    public hasNestedFieldInQuery() {
        for (let key in this.query) {
            // 忽略对象顶层属性操作符
            if (this.isOperator(key)) {
                continue
            }
            // 子属性是否有对象
            const obj = this.query[key]
            if (typeof obj !== 'object') {
                continue
            }

            if (this.hasObjectIn(obj)) {
                return true
            }
        }
        return false
    }

    // 判断给定对象（Object）中是否存在某个属性为非操作符对象
    protected hasObjectIn(object: any) {
        for (let key in object) {
            // 检测到非操作符对象，即判定存在
            if (!this.isOperator(key)) {
                return true
            }
        }
        return false
    }

    // 转换 mongo 查询操作符到 sql
    protected mapQueryOperator(operator: string) {
        assert(this.isQueryOperator(operator), `invalid query: operator ${operator} must be query operator`)
        let op = ''
        switch (operator) {
            case QUERY_COMMANDS.EQ:
                op = '='
                break
            case QUERY_COMMANDS.NEQ:
                op = '<>'
                break
            case QUERY_COMMANDS.GT:
                op = '>'
                break
            case QUERY_COMMANDS.GTE:
                op = '>='
                break
            case QUERY_COMMANDS.LT:
                op = '<'
                break
            case QUERY_COMMANDS.LTE:
                op = '<='
                break
            case QUERY_COMMANDS.IN:
                op = 'in'
                break
            case QUERY_COMMANDS.NIN:
                op = 'not in'
                break
            case QUERY_COMMANDS.LIKE:
                op = 'like'
                break
        }

        assert(op != '', `invalid query: unsupperted query operator ${operator}`)
        return op
    }

    // 转换 mongo 逻辑操作符到 sql
    protected mapLogicOperator(operator: string) {
        assert(this.isLogicOperator(operator), `invalid query: operator ${operator} must be logic operator`)

        let op = ''
        switch (operator) {
            case LOGIC_COMMANDS.AND:
                op = 'and'
                break
            case LOGIC_COMMANDS.OR:
                op = 'or'
                break
        }

        assert(op != '', `invalid query: unsupperted logic operator ${operator}`)
        return op
    }

    protected checkField(field_name) {
        if (SecurityCheck.checkField(field_name) === false)
            throw new Error(`invalid field : '${field_name}'`)
    }
}

/**
 * 安全检测工具： SQL注入，字段合法性
 */
class SecurityCheck {

    // 检查字段名是否合法：data field, query field
    static checkField(name: string): boolean {
        if (this.isOperator(name)) {
            return true
        }

        const black_list = [
            ' ',
            '#',
            // ' or ',
            ';',
            `'`,
            `"`,
            '`',
            '-',
            '/',
            '*',
            '\\',
            '+',
            '%'
        ]
        if (this.containStrs(name, black_list)) {
            return false
        }

        return true
    }

    // 检查字段名是否合法：data field, query field
    static checkProjection(name: string): boolean {
        const black_list = [
            '#',
            ' or ',
            ';',
            `'`,
            `"`,
            '`',
            '+',
            '-',
            '/',
            '\\',
            '%',
        ]
        if (this.containStrs(name, black_list)) {
            return false
        }

        return true
    }

    static containStrs(source: string, str_list: string[]): boolean {
        for (const ch of str_list) {
            if (source.indexOf(ch) >= 0)
                return true
        }

        return false
    }

    // 是否为逻辑操作符
    static isLogicOperator(key: string): boolean {
        const keys = Object.keys(LOGIC_COMMANDS)
            .map(k => LOGIC_COMMANDS[k])
        return keys.includes(key)
    }

    // 是否为查询操作符(QUERY_COMMANDS)
    static isQueryOperator(key: string): boolean {
        const keys = Object.keys(QUERY_COMMANDS)
            .map(k => QUERY_COMMANDS[k])
        return keys.includes(key)
    }

    // 是否为操作符
    static isOperator(key: string): boolean {
        return this.isLogicOperator(key) || this.isQueryOperator(key)
    }
}