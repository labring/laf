const assert = require('assert')
const client = require('../../dist/commonjs/index')

function getAccessToken(){
  return 'test-token-xxx'
}

const config = {
  entryUrl: 'http://localhost:8080/entry',
  getAccessToken,
}

describe('Database', function () {
  it('add one should be ok', async () => {
    const cloud = client.init(config)

    const result = await cloud.database()
      .collection('categories')
      .add({
        title: 'title-add-2',
        content: 'content-add-2'
      })

    console.log({result})
    const {data} = await cloud.database()
      .collection('categories')
      .doc(result.id)
      .get()

    assert.ok(result.id)
    assert.equal(data[0]._id, result.id)
  })
})