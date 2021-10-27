
const assert = require('assert')
const { MysqlAccessor, Proxy, ActionType } = require('../../dist')
const { SqlBuilder } = require('../../dist/accessor/sql_builder')
const config = require('./_db')

describe('Database Mysql join', function () {
  this.timeout(10000)

  const accessor = new MysqlAccessor({
    database: config.db,
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port
  })

  const table = 'test_tbl'
  const sub_table = 'test_subtbl'

  let entry = new Proxy(accessor)

  before(async () => {
    await accessor.conn.execute(`create table IF NOT EXISTS ${table} (id int(11) NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL, primary key(id))`)
    await accessor.conn.execute(`insert into ${table} (id, name) values(111, 'less-api-1')`)
    await accessor.conn.execute(`insert into ${table} (id, name) values(112, 'less-api-2')`)

    await accessor.conn.execute(`create table IF NOT EXISTS ${sub_table} (id int(11) NOT NULL AUTO_INCREMENT, parent_id int(11) NOT NULL, name varchar(255) NOT NULL, age int, primary key(id))`)
    await accessor.conn.execute(`insert into ${sub_table} (parent_id,name, age) values(111, 'sub-less-api-1', 22)`)
    await accessor.conn.execute(`insert into ${sub_table} (parent_id, name, age) values(112, 'sub-less-api-2', 29)`)
  })

  it('read with joins should be ok', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: { [`${table}.id`]: 111 },
      projection: { 'test_tbl.*': 1, 'test_subtbl.id sid': 1, 'test_subtbl.name sname': 1, 'test_subtbl.age': 1},
      joins: [
        { type: 'left', collection: sub_table, leftKey: 'id', rightKey: 'parent_id'}
      ]
    }

    const r = await entry.execute(params)

    assert.ok(r.list instanceof Array)
    assert.strictEqual(r.list.length, 1)
    assert.strictEqual(r.list[0].id, 111)
    assert.strictEqual(r.list[0].name, 'less-api-1')
    assert.strictEqual(r.list[0].age, 22)
  })

  after(async () => {
    await accessor.conn.execute(`drop table ${table}`)
    await accessor.conn.execute(`drop table ${sub_table}`)
    accessor.close()
  })
})