const { getDb  } = require('../_utils')
const assert = require('assert')

describe('db-ql(unit): db::limit() & skip()', () => {
  it('get() default limit is 100 should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .get()
    
    assert.equal(req.params.limit, 100)
  })

  it('limit().skip() should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .limit(33)
      .skip(77)
      .get()
    
    assert.strictEqual(req.params.limit, 33)
    assert.strictEqual(req.params.offset, 77)
  })

  it('where({ filters }) with limit() skip() should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .where({
        name: 'laf',
        status: 1
      })
      .limit(555)
      .skip(999)
      .get()
    
    assert.strictEqual(req.params.limit, 555)
    assert.strictEqual(req.params.offset, 999)
    assert.deepEqual(req.params.query, { name: 'laf', status: 1 })
  })
})