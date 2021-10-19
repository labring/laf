const assert = require('assert')
const { Proxy, MongoAccessor, ActionType } = require('../../dist')
const { dbconfig } = require('./_db')

const COLL_NAME = 'test_update'
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

describe('db-proxy(mongo): db.update()', function () {
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

  it('update first without query should be ok', async () => {
    await restoreTestData(coll)

    let params = {
      collection: COLL_NAME,
      action: ActionType.UPDATE,
      query: {},
      data: { 
        $set: {
          title: 'title-updated-1' 
        }
      },
      merge: true
    }
    const result = await entry.execute(params)

    assert.equal(result.updated, 1) // modified
    assert.equal(result.matched, 1) // matched

    const updated = await coll.find().toArray()
    assert.equal(updated[0].title, 'title-updated-1')       // changed
    assert.equal(updated[0].content, TEST_DATA[0].content)  // unchanged

    assert.equal(updated[1].title, TEST_DATA[1].title)       // unchanged
    assert.equal(updated[1].content, TEST_DATA[1].content)   // unchanged

    assert.equal(updated[1].title, TEST_DATA[1].title)       // unchanged
    assert.equal(updated[1].content, TEST_DATA[1].content)   // unchanged
  })

  it('update one with query should be ok', async () => {
    await restoreTestData(coll)

    let params = {
      collection: COLL_NAME,
      action: ActionType.UPDATE,
      query: {
        title: TEST_DATA[0].title
      },
      data: { 
        $set: {
          title: 'title-updated-1' 
        }
      },
      merge: true
    }
    const result = await entry.execute(params)

    assert.equal(result.updated, 1) // modified
    assert.equal(result.matched, 1) // matched

    const [updated] = await coll.find().toArray()
    assert.equal(updated.title, 'title-updated-1') // changed
    assert.equal(updated.content, TEST_DATA[0].content) // unchanged
  })

  it('update one with operator [$set] existing in data should be ok', async () => {
    await restoreTestData(coll)

    let params = {
      collection: COLL_NAME,
      action: ActionType.UPDATE,
      query: {
        title: TEST_DATA[0].title
      },
      data: {
        $set: {
          title: 'title-updated-1'
        }
      },
      merge: true
    }
    const result = await entry.execute(params)

    assert.equal(result.updated, 1) // modified
    assert.equal(result.matched, 1) // matched

    const [updated] = await coll.find().toArray()
    assert.equal(updated.title, 'title-updated-1')          // changed
    assert.equal(updated.content, TEST_DATA[0].content)     // unchanged
  })

  it('update one with operator [$push] existing in data should be ok', async () => {
    await restoreTestData(coll)

    let params = {
      collection: COLL_NAME,
      action: ActionType.UPDATE,
      query: {
        title: TEST_DATA[0].title
      },
      data: {
        $set: { title: 'title-updated-1'},
        $push: {
            arr: 'item'
        }
      },
      merge: true
    }
    const result = await entry.execute(params)

    assert.equal(result.updated, 1) // modified
    assert.equal(result.matched, 1) // matched

    const [updated] = await coll.find().toArray()
    assert.ok(updated.arr instanceof Array)
    assert.equal(updated.arr[0], 'item')
    assert.equal(updated.title, 'title-updated-1')          // changed
    assert.equal(updated.content, TEST_DATA[0].content)     // unchanged
  })

  it('update all should be ok', async () => {
    await restoreTestData(coll)

    let params = {
      collection: COLL_NAME,
      action: ActionType.UPDATE,
      query: {},
      data: { 
        $set: {
          title: 'title-updated-all' 
        }
      },
      merge: true,
      multi: true
    }
    const result = await entry.execute(params)

    assert.equal(result.updated, 3)   // modified
    assert.equal(result.matched, 3)           // matched

    const updated = await coll.find().toArray()
    assert.equal(updated[0].title, 'title-updated-all')         // changed
    assert.equal(updated[0].content, TEST_DATA[0].content)      // unchanged

    assert.equal(updated[1].title, 'title-updated-all')         // changed
    assert.equal(updated[1].content, TEST_DATA[1].content)      // unchanged

    assert.equal(updated[2].title, 'title-updated-all')         // changed
    assert.equal(updated[2].content, TEST_DATA[2].content)      // unchanged
  })

  it('update parts using $or in query should be ok', async () => {
    await restoreTestData(coll)

    let params = {
      collection: COLL_NAME,
      action: ActionType.UPDATE,
      query: {
        $or: [
          {title: TEST_DATA[0].title}, 
          {title: TEST_DATA[1].title}
        ]
      },
      data: { 
        $set: {
          title: 'title-updated-all' 
        }
      },
      merge: true,
      multi: true
    }
    const result = await entry.execute(params)

    assert.equal(result.updated, 2)   // modified
    assert.equal(result.matched, 2)           // matched

    const updated = await coll.find().toArray()
    assert.equal(updated[0].title, 'title-updated-all')         // changed
    assert.equal(updated[0].content, TEST_DATA[0].content)      // unchanged

    assert.equal(updated[1].title, 'title-updated-all')         // changed
    assert.equal(updated[1].content, TEST_DATA[1].content)      // unchanged
  })

  it('replace one should be ok', async () => {
    await restoreTestData(coll)

    let params = {
      collection: COLL_NAME,
      action: ActionType.UPDATE,
      query: {
        title: TEST_DATA[0].title
      },
      data: { title: 'title-updated-1' },
      merge: false
    }
    const result = await entry.execute(params)

    assert.equal(result.updated, 1) // modified
    assert.equal(result.matched, 1) // matched

    const [updated] = await coll.find().toArray()
    assert.equal(updated.title, 'title-updated-1') // changed
    assert.equal(updated.content, undefined) // replaced
  })

  after(async () => {
    await coll.deleteMany({})
    if (entry) accessor.conn.close()
  })
})
