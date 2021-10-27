
const assert = require('assert')
const { MysqlAccessor, Proxy, ActionType } = require('../../dist')
const config = require('./_db')

describe('Database Mysql delete', function () {
  this.timeout(10000)

  const accessor = new MysqlAccessor({
    database: config.db,
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port
  })

  const table = 'test_table'

  let entry = new Proxy(accessor)

  before(async () => {
    await accessor.conn.execute(`create table IF NOT EXISTS ${table} (id int(11) NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, age int, primary key(id))`)
    await accessor.conn.execute(`insert into ${table} (id,name, age) values(111, 'less-api-1', 2)`)
    await accessor.conn.execute(`insert into ${table} (id,name, age) values(112, 'less-api-2', 18)`)
    await accessor.conn.execute(`insert into ${table} (id,name, age) values(113, 'less-api-3', 28)`)
    await accessor.conn.execute(`insert into ${table} (id,name, age) values(114, 'less-api-3', 38)`)
  })

  it('delete one should be ok', async () => {
    const params = {
      collection: table,
      action: ActionType.REMOVE,
      query: { id: 111 },
    }
    const r = await entry.execute(params)

    assert.strictEqual(r.deleted, 1)
  })

  it('delete all but multi = false(default) should delete 1', async () => {
    const params = {
      collection: table,
      action: ActionType.REMOVE,
      query: {},
      // multi: false // default is false
    }
    const r = await entry.execute(params)
    assert.strictEqual(r.deleted, 1)
  })

  it('delete all with multi = true passed', async () => {
    const params = {
      collection: table,
      action: ActionType.REMOVE,
      query: {},
      multi: true
    }
    const r = await entry.execute(params)
    assert.strictEqual(r.deleted, 2)
  })

  after(async () => {
    await accessor.conn.execute(`drop table ${table}`)
    accessor.close()
  })
})