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
  it('add one should be ok', async () => {
    const cloud = client.init(config)

    const result = await cloud.database()
      .collection('people')
      .add({
        name: 'testuser'
      })

    const {data} = await cloud.database()
      .collection('people')
      .doc(result.id)
      .get()

    assert.ok(result.id)
    assert.equal(data[0]._id, result.id)
  })

  it('add many should be ok', async () => {
    const cloud = client.init(config)

    const result = await cloud.database()
      .collection('people')
      .add([
        {
          name: 'testuser1'
        },
        {
          name: 'testuser2'
        },
        {
          name: 'testuser3'
        }])
    
    console.log(result)

    assert.ok(result.id)
    assert.equal(Object.keys(result.id).length, 3)
  })
})