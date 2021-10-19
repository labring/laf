
const { Actions, getDb  } = require('../_utils')
const assert = require('assert')
const { ObjectId } = require('bson')

describe('db-ql(unit): db::doc().get()', () => {
  it('get() with string id should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .doc('test_id')
      .get()
    
    assert.strictEqual(req.action, Actions.get)
    assert.strictEqual(req.params.collectionName, 'tasks')
    assert.equal(req.params.limit, 1)
    assert.deepEqual(req.params.query, { _id: 'test_id'})

    assert.ok(!res.code)
    assert.ok(res.data === null)
  })

  it('get() with ObjectId should be ok', async () => {
    const { db, req } = getDb()

    const id = new ObjectId()
    const res = await db.collection('tasks')
      .doc(id)
      .get()
    
    assert.deepEqual(req.params.query, { _id: { $oid: id.toHexString() }})
  })

  it('field().get() with array projection should be ok', async () => {
    const { db, req } = getDb()

    const res = await db.collection('tasks')
      .doc('test_id')
      .field(['name', 'age', 'gender'])
      .get()
    
    assert.deepEqual(req.params.query, { _id: 'test_id'})
    assert.deepEqual(req.params.query, { _id: 'test_id' })
    assert.deepEqual(req.params.projection, { age: 1, gender: 1, name: 1 })
  })

  it('field().get() with object projection should be ok', async () => {
    const { db, req } = getDb()

    const res = await db.collection('tasks')
      .doc('test_id')
      .field({ name: 0, age: 0, gender: 0 })
      .get()
    
    assert.deepEqual(req.params.query, { _id: 'test_id'})
    assert.deepEqual(req.params.query, { _id: 'test_id' })
    assert.deepEqual(req.params.projection, { age: 0, gender: 0, name: 0 })
  })
})