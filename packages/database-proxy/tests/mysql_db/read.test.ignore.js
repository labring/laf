
const assert = require('assert')
const { MysqlAccessor, Proxy, ActionType } = require('../../dist')
const config = require('./_db')

describe('Database Mysql read', function () {
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
  })

  it('read one should be ok', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: { id: 111 },
    }
    const r = await entry.execute(params)

    assert.ok(r.list instanceof Array)
    assert.strictEqual(r.list.length, 1)
    assert.strictEqual(r.list[0].id, 111)
    assert.strictEqual(r.list[0].name, 'less-api-1')
    assert.strictEqual(r.list[0].age, 2)
  })

  it('read all passed', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: {},
    }
    const r = await entry.execute(params)

    assert.ok(r.list instanceof Array)
    assert.strictEqual(r.list.length, 2)
    assert.strictEqual(r.list[0].id, 111)
    assert.strictEqual(r.list[0].name, 'less-api-1')
    assert.strictEqual(r.list[0].age, 2)

    assert.strictEqual(r.list[1].id, 112)
  })

  it('read age > 2', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: { age: { $gt: 2 } },
    }
    const r = await entry.execute(params)

    assert.ok(r.list instanceof Array)
    assert.strictEqual(r.list.length, 1)
    assert.strictEqual(r.list[0].id, 112)
    assert.strictEqual(r.list[0].age, 18)
  })

  it('read by order age desc', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: {},
      order: [
        { field: 'age', direction: 'desc' }
      ]
    }
    const r = await entry.execute(params)

    assert.ok(r.list instanceof Array)
    assert.strictEqual(r.list.length, 2)
    assert.strictEqual(r.list[0].id, 112)
    assert.strictEqual(r.list[0].age, 18)
    assert.strictEqual(r.list[1].age, 2)
  })

  it('read by order age asc', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: {},
      order: [
        { field: 'age', direction: 'asc' }
      ]
    }
    const r = await entry.execute(params)

    assert.ok(r.list instanceof Array)
    assert.strictEqual(r.list.length, 2)
    assert.strictEqual(r.list[0].id, 111)
    assert.strictEqual(r.list[0].age, 2)
    assert.strictEqual(r.list[1].age, 18)
  })

  it('read with projection passed', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: {},
      projection: { name: 1, age: 1 }
    }
    const r = await entry.execute(params)

    assert.ok(r.list instanceof Array)
    assert.strictEqual(r.list.length, 2)
    assert.strictEqual(r.list[0].id, undefined)
    assert.strictEqual(r.list[0].name, 'less-api-1')
    assert.strictEqual(r.list[0].age, 2)
    assert.strictEqual(r.list[1].age, 18)
  })

  it('read with projection (vlaue = 0) should throw error', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: {},
      projection: { name: 0, age: 0 }
    }
    try {
      await entry.execute(params)
    } catch (error) {
      assert.strictEqual(error.message, 'invalid query: value of projection MUST be {true} or {1}, {false} or {0} is not supported in sql')
    }
  })

  it('read with like operator passed', async () => {
    const params = {
      collection: table,
      action: ActionType.READ,
      query: {
        name: {
          $like: "less-api%"
        }
      },
    }
    const r = await entry.execute(params)

    assert.ok(r.list instanceof Array)
    assert.strictEqual(r.list.length, 2)
    assert.strictEqual(r.list[0].id, 111)
    assert.strictEqual(r.list[0].name, 'less-api-1')
    assert.strictEqual(r.list[0].age, 2)

    assert.strictEqual(r.list[1].id, 112)
  })

  after(async () => {
    await accessor.conn.execute(`drop table ${table}`)
    accessor.close()
  })
})