
const { Actions, getDb  } = require('../_utils')
const assert = require('assert')

describe('db-ql(unit): db::get()', () => {
  it('get() without query options should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .get()
    
    assert.strictEqual(req.action, Actions.get)
    assert.strictEqual(req.params.collectionName, 'tasks')
    assert.equal(req.params.limit, 100)
    assert.deepEqual(req.params.query, undefined)

    assert.ok(!res.code)
    assert.ok(res.data instanceof Array)
  })

  it('getOne() without query options should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .getOne()
    
    assert.strictEqual(req.action, Actions.get)
    assert.strictEqual(req.params.collectionName, 'tasks')
    assert.equal(req.params.limit, 1)
    assert.deepEqual(req.params.query, undefined)

    assert.ok(!res.code)
    assert.ok(res.data === null)
  })
})