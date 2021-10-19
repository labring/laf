const assert = require('assert')
const { SqlQueryBuilder } = require('../../dist/accessor/sql_builder')
const { strictCompareArray } = require('../utils')


/**
 * 不同的查询情况(case N)，参考 docs/convert-sql.md 文档。
 */
describe('db-proxy(unit): class SqlQueryBuilder', () => {
  it('Query CASE 1: query = {} shoud be ok', () => {
    const query = {}
    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)
    assert.strictEqual(builder.build(), 'where 1=1')
  })

  it('Query CASE 2: query = { id: 0} shoud be ok', () => {
    const query = { id: 0 }
    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)

    const sql = builder.build()
    const values = builder.values()

    assert.strictEqual(sql, 'where 1=1 and id = ?')
    strictCompareArray(values, [0])
  })

  it('Query CASE 3: query = { id: 0, name: "abc"} shoud be ok', () => {
    const query = { id: 0, name: "abc" }
    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)

    const sql = builder.build()
    const values = builder.values()
    assert.strictEqual(sql, 'where 1=1 and id = ? and name = ?')
    strictCompareArray(values, [0, 'abc'])
  })

  it('Query CASE 4 nested property should return error', () => {
    const query = {
      id: 0,
      f1: {
        f2: 0
      }
    }
    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)

    try {
      const sql = builder.build()
      assert.strictEqual(sql, null)
    } catch (error) {
      assert.strictEqual(error.message, 'invalid query: nested property in query')
    }
  })

  it('Query CASE 5 shoud be ok', () => {
    const query = {
      f1: 0,
      f2: {
        $ne: 0
      },
      f3: {
        $in: [1, 2, true, "abc"]
      }
    }

    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)

    const sql = builder.build()
    const values = builder.values()
    assert.strictEqual(sql, 'where 1=1 and f1 = ? and f2 <> ? and f3 in (?,?,?,?)')
    strictCompareArray(values, [0, 0, 1, 2, true, 'abc'])
  })


  it('Query CASE 6 shoud be ok', () => {
    const query = {
      f1: 0,
      $and: [
        {
          f2: { $gt: 0 }
        },
        {
          f2: { $lt: 1 }
        }
      ]
    }

    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)

    const sql = builder.build()
    const values = builder.values()

    assert.strictEqual(sql, 'where 1=1 and f1 = ? and (f2 > ? and f2 < ?)')
    strictCompareArray(values, [0, 0, 1])
  })

  it('Query CASE 7 shoud be ok', () => {
    const query = {
      f1: 0,
      $or: [
        {
          f2: { $gt: 0 }
        },
        {
          f2: { $lt: 1 }
        }
      ]
    }

    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)

    const sql = builder.build()
    const values = builder.values()

    assert.strictEqual(sql, 'where 1=1 and f1 = ? and (f2 > ? or f2 < ?)')
    strictCompareArray(values, [0, 0, 1])
  })

  it('Query CASE 8 shoud be ok', () => {
    const query = {
      f1: 0,
      '$or': [
        { f2: 1 },
        { f6: { '$lt': 4000 } },
        {
          '$and': [{ f6: { '$gt': 6000 } }, { f6: { '$lt': 8000 } }]
        }
      ]
    }

    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)

    const sql = builder.build()
    const values = builder.values()

    assert.strictEqual(sql, 'where 1=1 and f1 = ? and (f2 = ? or f6 < ? or (f6 > ? and f6 < ?))')
    strictCompareArray(values, [0, 1, 4000, 6000, 8000])
  })

  it('Query CASE 9: like shoud be ok', () => {
    const query = {
      f1: 0,
      f2: {
        $like: '%keyword%'
      }
    }

    const builder = new SqlQueryBuilder(query)
    assert(builder instanceof SqlQueryBuilder)

    const sql = builder.build()
    const values = builder.values()

    assert.strictEqual(sql, 'where 1=1 and f1 = ? and f2 like ?')
    strictCompareArray(values, [0, '%keyword%'])
  })
})