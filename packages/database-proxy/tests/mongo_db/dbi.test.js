const assert = require('assert')
const { Proxy, MongoAccessor, ActionType, getDb } = require('../../dist')

const { dbconfig } = require('./_db')

const TEST_DATA = [
  { title: 'title-1', content: 'content-1' },
  { title: 'title-2', content: 'content-2' },
  { title: 'title-3', content: 'content-3' }
]

describe('db-proxy(mongo): DBI', function () {
  this.timeout(10000)

  const accessor = new MongoAccessor(dbconfig.dbName, dbconfig.url, dbconfig.connSettings)
  const db = getDb(accessor)

  before(async () => {
    // insert data
    await accessor.init()

    const r = await  db.collection('dbi_test').add(TEST_DATA[0])
    assert.ok(r.id)
  })

  it('read one should be ok', async () => {
    const { data } = await db.collection('dbi_test').where({}).get()
    assert.ok(data.length)
  })

  it('aggregate should be ok', async () => {

    const res = await db.collection('dbi_test')
      .aggregate([
        { $match: { title: 'title-1'}}
      ])
      .end()
    
   assert.equal(res.data.length, 1)
   assert.equal(res.data[0].title, 'title-1')
  })

  after(async () => {
    await db.collection('dbi_test').where({}).remove({ multi: true })
    accessor.close()
  })
})
