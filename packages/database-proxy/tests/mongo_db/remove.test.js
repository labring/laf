const assert = require('assert')
const { Proxy, MongoAccessor, ActionType } = require('../../dist')
const { dbconfig } = require('./_db')

const COLL_NAME = 'test_remove'
const TEST_DATA = [
  { title: 'title-1', content: 'content-1' },
  { title: 'title-2', content: 'content-2' },
  { title: 'title-3', content: 'content-3' }
]

async function restoreTestData (coll) {
  await coll.deleteMany({})
  const r = await coll.insertMany(TEST_DATA)
  assert.equal(r.insertedCount, TEST_DATA.length)
}

describe('db-proxy(mongo): db.remove()', function () {
  this.timeout(10000)

  const accessor = new MongoAccessor(dbconfig.dbName, dbconfig.url, dbconfig.connSettings)
  let entry = new Proxy(accessor)
  let coll = null

  before(async () => {
    await accessor.init()

    // insert data
    coll = accessor.db.collection(COLL_NAME)
    await restoreTestData(coll)
  })

  it('remove all should be ok', async () => {
    await restoreTestData(coll)

    const params = {
      collection: COLL_NAME,
      action: ActionType.REMOVE,
      multi: true
    }
    const r = await entry.execute(params)
    assert.equal(r.deleted, 3)

    const data = await coll.find().toArray()
    assert.equal(data.length, 0)
  })

  it('remove one should be ok', async () => {
    await restoreTestData(coll)

    const params = {
      collection: COLL_NAME,
      action: ActionType.REMOVE,
      query: { title: 'title-1' }
    }
    const r = await entry.execute(params)
    assert.equal(r.deleted, 1)

    const data = await coll.find().toArray()
    assert.equal(data.length, 2)
    assert.equal(data[0].title, 'title-2')
    assert.equal(data[0].content, 'content-2')
  })

  it('remove two should be ok', async () => {
    await restoreTestData(coll)

    const params = {
      collection: COLL_NAME,
      action: ActionType.REMOVE,
      query: {
        $or: [{ title: 'title-1' }, { title: 'title-2' }]
      },
      multi: true
    }
    const r = await entry.execute(params)
    assert.equal(r.deleted, 2)

    const data = await coll.find().toArray()

    assert.equal(data.length, 1)
    assert.equal(data[0].title, 'title-3')
    assert.equal(data[0].content, 'content-3')
  })

  after(async () => {
    await coll.deleteMany({})
    if (entry) accessor.conn.close()
  })
})
