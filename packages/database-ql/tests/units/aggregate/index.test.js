
const { Actions, getDb  } = require('../_utils')
const assert = require('assert')
const { ObjectId } = require('bson')

describe('db-ql(unit): db::aggregate()', () => {
  it('aggregate() with raw pipeline should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .aggregate([
        {
          $match: {
            name: 'laf'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'uid',
            foreignField: '_id',
            as: 'user'
          }
        }
      ])
      .end()
    
    // console.log(res, req.params)
    assert.strictEqual(req.action, Actions.aggregate)
    assert.strictEqual(req.params.collectionName, 'tasks')
    assert.strictEqual(req.params.stages.length, 2)

    assert.ok(!res.code)
    assert.ok(res.data instanceof Array)
  })

  it('aggregate() with empty should be rejected', async () => {
    const { db, req } = getDb()
    await db.collection('tasks')
      .aggregate([])
      .end()
      .catch(err => {
        assert.equal(err.toString(),'Error: Aggregation stage cannot be empty' )
       })
  })
})