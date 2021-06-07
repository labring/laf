import { MongoAccessor, getDb } from 'less-api'
import Config from '../config'
import { getLogger } from './logger'

export const accessor = new MongoAccessor(Config.db.database, Config.db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

accessor.setLogger(getLogger('server:db', 'warning'))

// 为了在外部能够等待异步的数据库连接
accessor.init()

// 获取 db 对象
export const db = getDb(accessor)