

const assert = require('assert')
const { ObjectId } = require('bson')
const { getDb  } = require('../_utils')


describe('db-ql(unit): db::where()', () => {
  it('where({}) should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .where({})
      .get()
    
    assert.deepEqual(req.params.query, {})
  })

  it('where({ filters }) should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .where({
        name: 'laf',
        status: 1
      })
      .get()
    
    assert.deepEqual(req.params.query, { name: 'laf', status: 1 })
  })

  it('where() with date type should be ok', async () => {
    const { db, req } = getDb()
    const current = new Date()
    const res = await db.collection('tasks')
      .where({
        name: 'laf',
        created_at: current
      })
      .get()
    
    assert.strictEqual(req.params.query.name, 'laf')
    assert.deepEqual(req.params.query.created_at, { $date:  current.toISOString()})
  })

  it('where() with RegExp should be ok', async () => {
    const { db, req } = getDb()
    const res = await db.collection('tasks')
      .where({
        reg: /^abc.*$/,
        reg2: /^abc.*$/i,
        reg3: {
          $regex: '^abc.*$',
          $options: ''
        },
        reg4: db.RegExp({ regexp: '^abc.*$' }),
        reg5: new RegExp('^abc.*$', 'i')
      })
      .get()
    
    assert.deepEqual(req.params.query.reg, { '$regularExpression': { pattern: '^abc.*$', 'options': ''} })
    assert.deepEqual(req.params.query.reg2, { '$regularExpression': { pattern: '^abc.*$', 'options': 'i'} })
    assert.deepEqual(req.params.query.reg3, { '$regex': '^abc.*$', '$options': '' })
    assert.deepEqual(req.params.query.reg4, { '$regex': '^abc.*$', '$options': '' })
    assert.deepEqual(req.params.query.reg5, { '$regularExpression': { pattern: '^abc.*$', 'options': 'i'} })
  })


  it('where() with ObjectId should be ok', async () => {
    const { db, req } = getDb()
    const id = new ObjectId()
    const res = await db.collection('tasks')
      .where({
        _id: id
      })
      .get()
    
    assert.deepEqual(req.params.query._id, { $oid: id.toHexString() })
  })
})