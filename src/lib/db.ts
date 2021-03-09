/**
 * @file less-api  database
 */
import {  MysqlAccessor, getDb } from 'less-api'
import Config from '../config'

const accessor = new MysqlAccessor(Config.db)

// 获取 db 对象
const db = getDb(accessor)

// export
export {
    db,
    accessor
}