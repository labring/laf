const assert = require('assert')
const client = require('../../dist/commonjs/index')

function getAccessToken(){
  return 'test-token-xxx'
}

const config = {
  entryUrl: 'http://b747bfc3-3316-460c-aea6-3c648898c711.bspapp.com/http/entry',
  getAccessToken
}

describe('Database', function () {
  const cloud = client.init(config)
  const db = cloud.database()
  const _ = db.command
  const coll = db.collection('people')

  let result = {}
  before(async () => {
    result = await coll.add({
        title: 'update-test-single-title',
        content: 'update-test-single-content',
        age: 10
    })
    assert.ok(result.id)
    // add multi docs for update
    await coll.add(
      [{
        title: 'update-test-multi-title1',
        content: 'update-test-multi-content1',
        age: 15
      },{
        title: 'update-test-multi-title2',
        content: 'update-test-multi-content2',
        age: 16
      },{
        title: 'update-test-multi-title3',
        content: 'update-test-multi-content3',
        age: 17
      }
    ])
  })

  it('update one should be ok', async () => {
    const updated = await coll.doc(result.id)
      .update({
        title: 'update-test-title-modified'
      })
    const { data } = await coll.doc(result.id)
      .get()

    assert.equal(data[0]._id, result.id)
    assert.equal(data[0].title, 'update-test-title-modified')
  })

  it('update many should be ok', async () => {

    const updated = await coll
      .where({
        title: '/update-test-multi-title*/'
      })
      .update({
        content: 'update-test-multi-content'
      })
    console.log(updated)
    const { data } = await coll.get()
    data.forEach( d => {
      if(d.title.indexOf('update-test-multi-title') != -1) {
        assert.equal(d.content, 'update-test-multi-content')
      }
    })
  })

  it('set one should be ok', async () => {
    
    const updated = await coll
      .doc(result.id)
      .set({
        setField: 'content-set-1',
        title: 'update-test-title-set'
      })
       
    const { data } = await coll
      .doc(result.id)
      .get()
      
      assert.equal(data[0]._id, result.id)
      assert.equal(data[0].setField, 'content-set-1')
  })

  after( async () => {
    // delete all documents we add for test
    await coll.where({
      title: '/update-test\\w+/'
    }).remove()
  })
})