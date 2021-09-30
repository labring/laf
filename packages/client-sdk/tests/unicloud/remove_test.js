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
  const coll = db.collection('people')
  const _ = db.command

  // add an document first, based on add function works well
  let result = {}
  before( async () => {
    const res = await coll.add(
      {
        name: 'test-remove-single-doc'
      }
    )
    result.id = res.id
    // add multi docs for remove
    await coll.add([
      {name: 'test-remove-multiuser'},
      {name: 'test-remove-multiuser'},
      {name: 'test-remove-multiuser'},
      {name: 'test-remove-multiuser'},
      {name: 'test-remove-multiuser'}
    ])
  })

  it('remove an specific doc should be ok', async () => {
    const res = await coll.doc(result.id).remove()
    assert.equal(res.deleted, 1)
  })

  it('remove multi docs should be ok', async () => {

    const res = await coll.where({name: '/test-remove-\\w+/'}).remove()
    assert.equal(res.deleted, 5)
  })

  after( async () => {
      await coll.where({_id: _.exists(true)}).remove()
  })
})