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
  const coll = cloud.database().collection('people')

  // add an document first, based on add function works well
  let result = {}
  before( async () => {
    const res = await coll.add(
      {
        name: 'test-add-user'
      }
    )
    result.id = res.id
  })

  it('read empty should be ok', async () => {
    const res = await coll.get()
    assert.ok(res.data instanceof Array)
  })

  it('read query should be ok', async () => {
    const res = await coll.where({name: 'test-add-user'}).get()
    assert.ok(res.data instanceof Array)
  })

  it('read by doc id should be ok', async () => {
    const res = await coll.doc(result.id).get()
    assert.equal(res.data[0]._id, result.id)
  })

})