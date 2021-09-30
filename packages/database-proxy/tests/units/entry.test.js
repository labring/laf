const assert = require('assert')
const { Entry, MongoAccessor } = require('../../dist')

describe('class Entry', () => {
  const accessor = new MongoAccessor('test-db', 'mongodb://localhost:27017')

  it('constructor() ok', () => {
    const entry = new Entry(accessor)

    assert.ok(entry.accessor instanceof MongoAccessor)
    assert.equal(entry.ruler.accessor, entry.accessor)
  })

  it('parseParams() ok', () => {
    const entry = new Entry(accessor)

    const reqParams = {
      collectionName: 'test-name',
      query: { _id: 'test-id'},
      other: 'test',
      action: 'database.queryDocument'
    }

    let r = entry.parseParams(reqParams)
    
    assert.equal(r.action, 'database.queryDocument')
    assert.equal(r.collection, 'test-name')
    assert.ok(r.query)
    assert.ok(!r.other)
    assert.equal(r.query._id, 'test-id')
  })

  it('parseParams() unknown action should get an error', () => {
    const entry = new Entry(accessor)

    try {
      entry.parseParams({ action: 'database.unknowAction'})
      throw new Error('should get an error but not')
    } catch (error) {
      assert.ok(error)
    }
  })
})
