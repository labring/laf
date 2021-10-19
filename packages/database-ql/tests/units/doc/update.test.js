
const { Actions, getDb  } = require('../_utils')
const assert = require('assert')
const { ObjectId, Binary } = require('bson')

describe('db-ql(unit): db::doc().update()', () => {
  it('update() should be ok', async () => {
    const { db, req } = getDb()

    const uid = new ObjectId()
    const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])
    const res = await db.collection('tasks')
      .doc('test_id')
      .update({
        uid: uid,
        name: 'laf',
        created_at: new Date(),
        pic: new Binary(buf)
      })
    
    assert.strictEqual(req.action, Actions.update)
    assert.strictEqual(req.params.collectionName, 'tasks')
    assert.equal(req.params.multi, false)
    assert.equal(req.params.merge, true)
    assert.equal(req.params.upsert, false)
    assert.deepEqual(req.params.query, { _id: 'test_id' })


    // check data
    assert.deepEqual(req.params.data.$set.uid, { $oid: uid.toHexString() })
    assert.ok(req.params.data.$set.created_at.$date)
    assert.equal(req.params.data.$set.pic.$binary.base64, buf.toString('base64'))

    // check result
    assert.ok(!res.code)
    assert.equal(res.updated,1)
  })
})