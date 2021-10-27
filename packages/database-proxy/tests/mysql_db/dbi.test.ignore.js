const assert = require('assert')
const { MysqlAccessor, getDb } = require('../../dist')

const config = require('./_db')

const TEST_DATA = [
  { name: 'title-1', age: 2 },
  { name: 'title-2', age: 18 },
  { name: 'title-3', age: 100 }
]
const table = 'test_table'

describe('Database Interface with Mysql read', function () {
  this.timeout(10000)

  const accessor = new MysqlAccessor({
    database: config.db,
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port
  })


  let coll = null
  let db = null

  before(async () => {
    // insert data
    // await accessor.init()
    await accessor.conn.execute(`create table IF NOT EXISTS ${table} (id int(11) NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, age int, primary key(id))`)

    db = await getDb(accessor)

    coll = await db.collection(table)
    const r = await coll.add(TEST_DATA[0])
    assert.ok(r.id)
  })

  it('read one should be ok', async () => {

    const { data } = await coll.where({}).get()
    assert.ok(data.length)

  })

  after(async () => {
    await accessor.conn.execute(`drop table ${table}`)
    accessor.close()
  })
})
