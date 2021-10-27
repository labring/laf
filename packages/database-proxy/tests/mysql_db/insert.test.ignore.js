
const assert = require('assert')
const { MysqlAccessor, Proxy, ActionType } = require('../../dist')
const config = require('./_db')

describe('Database Mysql add', function () {
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
  })

  it('add() one should be ok', async () => {

    let params = {
      collection: table,
      action: ActionType.ADD,
      data: { id: 123, name: 'less-api', age: 2 },
    }
    const r = await entry.execute(params)
    assert.strictEqual(r._id, 123)
    assert.strictEqual(r.insertedCount, 1)

    // check inserted result
    const [rows] = await accessor.conn.execute(`select * from ${table}`)

    assert.ok(rows instanceof Array)
    assert.strictEqual(rows.length, 1)
    assert.strictEqual(rows[0].name, 'less-api')
    assert.strictEqual(rows[0].age, 2)
  })

  it('add() without data should got error', async () => {

    let params = {
      collection: table,
      action: ActionType.ADD
    }
    try {
      await entry.execute(params)
      assert(false)
    } catch (error) {
      assert.strictEqual(error.message, 'invalid data: data can NOT be empty object')
    }
  })

  it('add() data with {} object should got error', async () => {

    let params = {
      collection: table,
      action: ActionType.ADD,
      data: {}
    }
    try {
      await entry.execute(params)
      assert(false)
    } catch (error) {
      assert.strictEqual(error.message, 'invalid data: data can NOT be empty object')
    }
  })

  it('add() data with array should got error', async () => {

    let params = {
      collection: table,
      action: ActionType.ADD,
      data: [
        { id: 123, name: 'less-api', age: 2 },
        { id: 123, name: 'less-api', age: 2 }
      ]
    }
    try {
      await entry.execute(params)
      assert(false)
    } catch (error) {
      assert.strictEqual(error.message, 'invalid data: data cannot be Array while using SQL')
    }
  })

  after(async () => {
    await accessor.conn.execute(`drop table ${table}`)
    accessor.close()
  })
})