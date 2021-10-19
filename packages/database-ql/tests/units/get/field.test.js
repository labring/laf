const { getDb  } = require('../_utils')
const assert = require('assert')

describe('db-ql(unit): db::field()', () => {
  it('field(value: string[]) should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .field(['name', 'gender'])
      .get()
    
    assert.deepEqual(req.params.projection, { name: 1, gender: 1 })
  })

  it('field(value: { [key: string]: 1 }) should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .field({ name: 1, gender: 1 })
      .get()
    
      assert.deepEqual(req.params.projection, { name: 1, gender: 1 })
  })

  it('field(value: { [key: string]: 0 }) should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .field({ name: 0, gender: 0 })
      .get()
    
      assert.deepEqual(req.params.projection, { name: 0, gender: 0 })
  })
})