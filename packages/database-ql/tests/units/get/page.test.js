const { getDb  } = require('../_utils')
const assert = require('assert')

describe('db-ql(unit): db::page()', () => {
  it('page() should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .page()
      .get()
    
    // console.log(req.params)
    assert.equal(req.params.limit, 10)
    assert.equal(req.params.count, true)
  })

  it('page({ current: 2, size: 10}) should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .page({ current: 3, size: 20 })
      .get()
    
    // console.log(req.params)
    assert.equal(req.params.offset, 40)
    assert.equal(req.params.limit, 20)
    assert.equal(req.params.count, true)
  })
 })