import { MongoAccessor, getDb } from 'less-api'
import Config from '../config'
import { getLogger } from './logger'

export const accessor = new MongoAccessor(Config.db.database, Config.db.uri, {
    poolSize: Config.db.poolSize,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

accessor.setLogger(getLogger('server:db', 'warning'))

accessor.init()

// 获取 db 对象
export const db = getDb(accessor)