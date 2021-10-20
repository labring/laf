
const { Actions, getDb  } = require('../_utils')
const assert = require('assert')
const { ObjectId } = require('bson')

describe('db-ql(unit): db::aggregate()::$lookup', () => {
  it('lookup() should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .aggregate()
      .lookup({
        from: 'users',
        localField: 'uid',
        foreignField: '_id',
        as: 'user'
      })
      .end()
    
    // console.log(res, req.params)
    assert.strictEqual(req.action, Actions.aggregate)
    assert.strictEqual(req.params.collectionName, 'tasks')
    assert.strictEqual(req.params.stages.length, 1)


    const { stageKey, stageValue } = req.params.stages[0]
    assert.ok(stageKey, '$lookup')
    assert.ok(stageValue.includes(`"from":"users"`))
    assert.ok(stageValue.includes(`"localField":"uid"`))
    assert.ok(stageValue.includes(`"foreignField":"_id"`))
    assert.ok(stageValue.includes(`"as":"user"`))


    assert.ok(!res.code)
    assert.ok(res.data instanceof Array)
  })
})