
const { Actions, getDb  } = require('../_utils')
const assert = require('assert')
const { ObjectId, Binary } = require('bson')

describe('db-ql(unit): db::aggregate()::$match', () => {
  it('match() should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .aggregate()
      .match({
        name: 'laf',
        uid: new ObjectId(),
        created_at: new Date(),
        avatar: new Binary(Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]))
      })
      .end()
    
    assert.strictEqual(req.action, Actions.aggregate)
    assert.strictEqual(req.params.collectionName, 'tasks')
    assert.strictEqual(req.params.stages.length, 1)

    const { stageKey, stageValue } = req.params.stages[0]
    assert.ok(stageKey, '$match')
    assert.ok(stageValue.includes(`"name":"laf"`))
    assert.ok(stageValue.includes(`"uid":{"$oid":`))
    assert.ok(stageValue.includes(`"created_at":{"$date":`))
    assert.ok(stageValue.includes(`"avatar":{"$binary":`))


    assert.ok(!res.code)
    assert.ok(res.data instanceof Array)
  })
})