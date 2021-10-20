
const { Actions, getDb  } = require('../_utils')
const assert = require('assert')
const { ObjectId, Binary } = require('bson')

describe('db-ql(unit): db::remove()', () => {
  it('remove() should be ok', async () => {
    const { db, req } = getDb()

    const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
    const uid = new ObjectId()
    const res = await db.collection('tasks')
      .where({ name: 'laf' })
      .remove()
    
    assert.strictEqual(req.action, Actions.remove)
    assert.strictEqual(req.params.collectionName, 'tasks')

    // check options 
    // console.log(req.params, res)
    assert.equal(req.params.multi, false)

    // check query
    assert.deepEqual(req.params.query, { name: 'laf' })
    
    // check result
    assert.ok(!res.code)
    assert.equal(res.deleted, 1)
  })
})