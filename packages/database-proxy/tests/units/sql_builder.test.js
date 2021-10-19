
const assert = require('assert')
const { SqlBuilder } = require('../../dist/accessor/sql_builder')
const { ActionType } = require('../../dist/types')
const { strictCompareArray } = require('../utils')

describe('db-proxy(unit): class SqlBuilder', () => {
  it('constructor() passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.READ,
      query: {},
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    assert.strictEqual(builder.query, params.query)
    assert.strictEqual(builder.table, params.collection)
  })

  it('select() with query: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.READ,
      query: { id: 0, name: 'abc' },
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.select()
    assert.strictEqual(sql, 'select * from test_table where 1=1 and id = ? and name = ?  limit 0,100')
    strictCompareArray(values, [0, 'abc'])
  })

  it('select() with projection: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.READ,
      query: { id: 0, name: 'abc' },
      projection: { id: true, name: true }
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.select()

    assert.strictEqual(sql, 'select id,name from test_table where 1=1 and id = ? and name = ?  limit 0,100')
    strictCompareArray(values, [0, 'abc'])
  })

  it('select() with order: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.READ,
      query: { id: 0, name: 'abc' },
      order: [
        { field: 'id', direction: 'asc' },
        { field: 'name', direction: 'desc' }
      ],
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.select()

    assert.strictEqual(sql, 'select * from test_table where 1=1 and id = ? and name = ? order by id asc,name desc limit 0,100')
    strictCompareArray(values, [0, 'abc'])
  })

  it('left join: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.READ,
      query: { id: 0, name: 'abc' },
      joins: [
        { collection: 'x_table', type: 'left', leftKey: 'xid', rightKey: 'id' },
        { collection: 'y_table', type: 'left', leftKey: 'yid', rightKey: 'id' },
      ]
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.select()

    assert.strictEqual(sql, 'select * from test_table  left join x_table on test_table.xid = x_table.id left join y_table on test_table.yid = y_table.id where 1=1 and id = ? and name = ?  limit 0,100')
    strictCompareArray(values, [0, 'abc'])
  })

  it('count() with query: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.COUNT,
      query: { id: 0, name: 'abc' },
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.count()

    assert.strictEqual(sql, 'select count(*) as total from test_table where 1=1 and id = ? and name = ?')
    strictCompareArray(values, [0, 'abc'])
  })

  it('delete() with query: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.REMOVE,
      query: { id: 0, name: 'abc' },
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.delete()

    assert.strictEqual(sql, 'delete from test_table where 1=1 and id = ? and name = ?  limit 1 ')
    strictCompareArray(values, [0, 'abc'])
  })

  it('delete() with multi = true: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.REMOVE,
      query: { id: 0, name: 'abc' },
      multi: true
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.delete()

    assert.strictEqual(sql, 'delete from test_table where 1=1 and id = ? and name = ?   ')
    strictCompareArray(values, [0, 'abc'])
  })

  it('insert() with data: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.ADD,
      data: { id: 0, name: 'abc' },
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.insert()

    assert.strictEqual(sql, 'insert into test_table (id,name) values (?,?)')
    strictCompareArray(values, [0, 'abc'])
  })

  it('update() with data: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.UPDATE,
      data: { $set: { id: 0, name: 'abc' } },
      merge: true
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.update()

    assert.strictEqual(sql, 'update test_table set id=?,name=? where 1=1  limit 1')
    strictCompareArray(values, [0, 'abc'])
  })

  it('update() with query: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.UPDATE,
      data: { $set: { id: 1, name: 'xyz' } },
      query: { id: 0, name: 'abc' },
      merge: true
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.update()

    assert.strictEqual(sql, 'update test_table set id=?,name=? where 1=1 and id = ? and name = ?  limit 1')
    strictCompareArray(values, [1, 'xyz', 0, 'abc'])
  })

  it('update() with  multi = true: passed', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.UPDATE,
      data: { $set: { id: 1, name: 'xyz' } },
      query: { id: 0, name: 'abc' },
      multi: true,
      merge: true
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.update()

    assert.strictEqual(sql, 'update test_table set id=?,name=? where 1=1 and id = ? and name = ?  ')
    strictCompareArray(values, [1, 'xyz', 0, 'abc'])
  })

  it('update() with operator $unset $inc $mul', () => {
    const params = {
      collection: 'test_table',
      action: ActionType.UPDATE,
      data: { $set: { id: 1, name: 'xyz' }, $unset: { status: '' }, $inc: { age: 2 }, $mul: { amount: 4 } },
      query: { id: 0, name: 'abc' },
      merge: true
    }

    const builder = new SqlBuilder(params)
    assert(builder instanceof SqlBuilder)

    const { sql, values } = builder.update()

    assert.strictEqual(sql, 'update test_table set id=?,name=?,age= age + ?,amount= amount * ?,status= null where 1=1 and id = ? and name = ?  limit 1')
    strictCompareArray(values, [1, 'xyz', 2, 4, 0, 'abc'])
  })
})