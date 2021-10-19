const { getDb  } = require('../_utils')
const assert = require('assert')

describe('db-ql(unit): db::orderBy()', () => {
  it('orderBy() should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .orderBy('age', 'asc')
      .orderBy('score', 'desc')
      .get()
    
    assert.ok(req.params.order.length === 2)
    assert.deepEqual(req.params.order[0], { field: 'age', direction: 'asc' })
    assert.deepEqual(req.params.order[1], { field: 'score', direction: 'desc' })
  })
})