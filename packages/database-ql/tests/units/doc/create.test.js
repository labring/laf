
const { Actions, getDb  } = require('../_utils')
const assert = require('assert')
const { ObjectId, Binary } = require('bson')

describe('db-ql(unit): db::doc().create()', () => {
  it('create() should be ok', async () => {
    const { db, req } = getDb()

    const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
    const res = await db.collection('tasks')
      .doc('nonsense_id')
      .create({
        uid: new ObjectId(),
        name: 'laf',
        created_at: new Date(),
        pic: new Binary(buf)
      })
    
    assert.strictEqual(req.action, Actions.add)
    assert.strictEqual(req.params.collectionName, 'tasks')
    assert.equal(req.params.multi, false)
    assert.equal(req.params.query, undefined)

    // validate data
    assert.ok(req.params.data.uid.$oid)
    assert.strictEqual(req.params.data.name, 'laf')
    assert.ok(req.params.data.created_at.$date)
    assert.ok(req.params.data.pic.$binary.base64)
    assert.ok(req.params.data.pic.$binary.subType)
    assert.equal(req.params.data.pic.$binary.base64, buf.toString('base64'))


    assert.ok(!res.code)
    assert.ok(res.insertedCount === 1)
    assert.equal(res.id, '0')
  })

  it('create() with empty object should be rejected', async () => {
    const { db, req } = getDb()

    const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
    await db.collection('tasks')
      .doc('nonsense_id')
      .create({})
      .catch(err => {
        assert.equal(err.toString(), 'Error: data cannot be empty object')
      })
  })
})