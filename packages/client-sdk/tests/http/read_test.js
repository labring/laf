const assert = require('assert')
const client = require('../../dist/commonjs/index')
const config = require('./config')

describe('client-sdk(http): db.get()', function () {
  it('read empty should be ok', async () => {
    const cloud = client.init({ dbProxyUrl: config.dbProxyUrl, getAccessToken: config.getAccessToken})

    const res = await cloud.database().collection('categories').get()

    assert.ok(res.data instanceof Array)
  })

})

