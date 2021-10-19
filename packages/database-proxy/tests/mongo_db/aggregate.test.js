const assert = require('assert')
const { EJSON } = require('bson')
const { Proxy, MongoAccessor, ActionType, Policy } = require('../../dist')

const { dbconfig } = require('./_db')

const TEST_DATA = [
  { title: 'title-1', content: 'content-1', state: 0, gender: 1 },
  { title: 'title-2', content: 'content-2', state: 1, gender: 0  },
  { title: 'title-3', content: 'content-3', state: 3, gender: 1  }
]

describe('db-proxy(mongo): db.aggregate()', function () {
  this.timeout(10000)

  const accessor = new MongoAccessor(dbconfig.dbName, dbconfig.url, dbconfig.connSettings)
  let proxy = new Proxy(accessor, new Policy)
  let coll = null

  before(async () => {
    await accessor.init()

    // insert data
    coll = accessor.db.collection('test_read')
    await coll.deleteMany({})
    const r = await coll.insertMany(TEST_DATA)
    assert.equal(r.insertedCount, TEST_DATA.length)
  })

  it('$match ', async () => {
    let params = {
      collection: 'test_read',
      action: ActionType.AGGREGATE,
      stages: [{
        stageKey: '$match',
        stageValue: EJSON.stringify({ title: TEST_DATA[0].title })
      }]
    }
    const data = await proxy.execute(params)
    assert.ok(data.list instanceof Array)
    assert.equal(data.list.length, 1)
  })

  it('$group ', async () => {
    const params = {
      collection: 'test_read',
      action: ActionType.AGGREGATE,
      stages: [{
        stageKey: '$group',
        stageValue: EJSON.stringify({
          _id: '$gender',
          items: {
            $push: { title: '$title', content: '$content', state: '$state' }
          }
        })
      }]
    }
    const data = await proxy.execute(params)
    assert.ok(data.list instanceof Array)
    assert.equal(data.list.length, 2)
  })

  after(async () => {

    await coll.deleteMany({})
    if (proxy) accessor.conn.close()
  })
})
