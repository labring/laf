/* eslint-disable indent */
const assert = require('assert')
const client = require('../../dist/commonjs/index')
const config = require('./config')
describe('client-sdk(http): db::update()', function () {
  const cloud = client.init({ dbProxyUrl: config.dbProxyUrl, getAccessToken: config.getAccessToken})

  let result = null
  before(async () => {
    result = await cloud.database()
      .collection('categories')
      .add({
        title: 'title-update-666',
        content: 'content-update-666',
        age: 0
      })

    assert.ok(result.id)
  })

  it('update one should be ok', async () => {
        
    const updated = await cloud.database()
      .collection('categories')
      .doc(result.id)
      .update({
        title: 'updated-title'
      })
       
    const { data } = await cloud.database()
      .collection('categories')
      .doc(result.id)
      .get()

    console.log(data)
    assert.equal(data._id, result.id)
    assert.equal(data.title, 'updated-title')
  })

  it('update with $operator should be ok', async () => {
    const db = cloud.database()
    const _ = db.command
    
    const updated = await db.collection('categories')
      .doc(result.id)
      .update({
        title: 'updated-title',
        age: _.inc(1),
        content: _.remove()
      })
       
    const { data } = await cloud.database()
      .collection('categories')
      .doc(result.id)
      .get()


    assert.equal(data._id, result.id)
    assert.equal(data.title, 'updated-title')
    assert.equal(data.age, 1)
    assert.equal(data.content, undefined)
  })

  it('update many should be ok', async () => {
    const db = cloud.database()
    const _ = db.command
    
    const updated = await db.collection('categories')
      .where({})
      .update({
        updatedField: 'content-add-3'
      }, {multi: true})
       

    const { data } = await cloud.database()
      .collection('categories')
      .get()

      data.forEach( d => {
          assert.equal(d.updatedField, 'content-add-3')
      })
  })

  it('set one should be ok', async () => {
    const db = cloud.database()
    const _ = db.command
    
    const updated = await db.collection('categories')
      .doc(result.id)
      .set({
        setField: 'content-set-1'
      })
       
    const { data } = await cloud.database()
      .collection('categories')
      .doc(result.id)
      .get()
      
      assert.equal(data._id, result.id)
      assert.equal(data.setField, 'content-set-1')
  })
})