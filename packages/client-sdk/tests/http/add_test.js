const assert = require('assert')
const client = require('../../dist/commonjs/index')
const config = require('./config')

describe('client-sdk(http): db.add()', function () {
  it('add one should be ok', async () => {
    const cloud = client.init({ dbProxyUrl: config.dbProxyUrl, getAccessToken: config.getAccessToken})

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
    assert.equal(data._id, result.id)
  })
})