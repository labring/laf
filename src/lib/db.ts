/**
 * @file less-api  database
 */
import { MongoAccessor, getDb } from 'less-api'
import Config from '../config'
import { getLogger } from './logger'

const accessor = new MongoAccessor(Config.db.database, Config.db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

accessor.setLogger(getLogger('server:db'))

accessor.init()

// 获取 db 对象
const db = getDb(accessor)

// export
export {
    db,
    accessor
}