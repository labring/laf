/* eslint-disable indent */
const assert = require('assert')
const client = require('../../dist/commonjs/index')

const cloud = client.init({
  entryUrl: 'http://localhost:8088/entry',
  getAccessToken: () => '',
  primaryKey: 'id'
})

describe('Database sql', function () {

  let result = null
  before(async () => {
    result = await cloud.database()
      .collection('categories')
      .add({
        name: 'category-add'
      })

    assert.ok(result.id)
  })

  it('update one should be ok', async () => {
    const db = cloud.database()
        
    const updated = await db
      .collection('categories')
      .doc(result.id)
      .update({
        name: 'updated-title'
      })
       
    assert.ok(updated.ok)
    const { data } = await cloud.database()
      .collection('categories')
      .doc(result.id)
      .get()

    assert.equal(data[0].id, result.id)
    assert.equal(data[0].name, 'updated-title')
  })

  it('update many should be ok', async () => {
    const db = cloud.database()
    
    const updated = await db.collection('categories')
      .where({})
      .update({
        name: 'content-update-many'
      }, { multi: true})
      
    assert.ok(updated.ok)
    const res = await cloud.database()
      .collection('categories')
      .get()
    
    res?.data?.forEach( d => {
        assert.strictEqual(d.name, 'content-update-many')
    })
  })

  it('set one shouWld be rejected since merge = true forbidden in sql', async () => {
    const db = cloud.database()
    
    const res = await db.collection('categories')
      .doc(result.id)
      .set({
        setField: 'content-set-1'
      })
    
    assert.ok(res.code > 0)
    assert.ok(res.error)
    assert.ok(res.error, 'AssertionError [ERR_ASSERTION]: invalid params: {merge} should be true in sql')
  })
})