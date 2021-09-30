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
  const _ = cloud.database().command

  it('count number should not be zero', async () => {
    const res = await coll.where({_id: _.exists(true)}).count()
    console.log(res)
    assert.ok(res.total > 0)
  })

})