const assert = require('assert')
const { Proxy, MongoAccessor, ActionType } = require('../../dist')

const { dbconfig } = require('./_db')

const COLL_NAME = 'test_add'

async function restoreTestData (coll) {
  await coll.deleteMany({})
}

describe('db-proxy(mongo): db.add()', function () {
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

    it('add one should be ok', async () => {
        await restoreTestData(coll)
    
        let params = {
          collection: COLL_NAME,
          action: ActionType.ADD,
          data: { title: 'title-1', content: 'content-1' },
        }
        const r = await entry.execute(params)
        assert.ok(r._id)

        const inserted = await coll.find().toArray()
        assert.ok(inserted instanceof Array)
        assert.equal(inserted.length, 1)
        assert.equal(inserted[0].title, 'title-1')
        assert.equal(inserted[0].content, 'content-1')
    })

    it('add two docs with multi === true should be ok', async () => {
        await restoreTestData(coll)
        
        const TEST_DATA = [
            { title: 'title-1', content: 'content-1' },
            { title: 'title-2', content: 'content-2' }
        ]
        let params = {
          collection: COLL_NAME,
          action: ActionType.ADD,
          data: TEST_DATA,
          multi: true
        }

        const r = await entry.execute(params)
        assert.equal(r.insertedCount, 2)
        assert.ok(r._id)   // object: { '0': 5d71614ff3922156c0f01f23, '1': 5d71614ff3922156c0f01f24 } 

        const inserted = await coll.find().toArray()

        assert.ok(inserted instanceof Array)
        assert.equal(inserted.length, 2)

        assert.equal(inserted[0].title, 'title-1')
        assert.equal(inserted[0].content, 'content-1')

        assert.equal(inserted[1].title, 'title-2')
        assert.equal(inserted[1].content, 'content-2')
    })

    it('add tow docs with multi === false should catch an error', async () => {
        await restoreTestData(coll)
        
        const TEST_DATA = [
            { title: 'title-1', content: 'content-1' },
            { title: 'title-2', content: 'content-2' }
        ]
        let params = {
          collection: COLL_NAME,
          action: ActionType.ADD,
          data: TEST_DATA,
          multi: false
        }
        
        try{
            await entry.execute(params)
        } catch (err) {
            assert.ok(err.toString().indexOf("BSON field 'insert.documents.0' is the wrong type 'array', expected type 'object'") > 0)
        }
    })

    after(async () => {
        await coll.deleteMany({})
        if (entry)  accessor.conn.close()
    })
})