const assert = require('assert')
const { Entry, MongoAccessor, ActionType, getDb } = require('../../dist')

const { dbconfig } = require('./_db')

const TEST_DATA = [
  { title: 'title-1', content: 'content-1' },
  { title: 'title-2', content: 'content-2' },
  { title: 'title-3', content: 'content-3' }
]

describe('Database read', function () {
  this.timeout(10000)

  const accessor = new MongoAccessor(dbconfig.dbName, dbconfig.url, dbconfig.connSettings)
  

  let coll = null
  let db = null

  before(async () => {
    // insert data
    await accessor.init()
    db = await getDb(accessor)

    coll = await db.collection('dbi_test')
    const r = await coll.add(TEST_DATA[0])
    assert.ok(r.id)
  })

  it('read one should be ok', async () => {

    const { data } = await coll.where({}).get()
    assert.ok(data.length)
  })

  after(async () => {
    await coll.where({}).remove()
    accessor.close()
  })
})
