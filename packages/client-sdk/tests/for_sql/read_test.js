const assert = require('assert')
const client = require('../../dist/commonjs/index')

const config = {
  entryUrl: 'http://localhost:8088/entry',
  getAccessToken: () => '',
}

describe('Database sql', function () {
  it('read all should be ok', async () => {
    const cloud = client.init(config)

    const res = await cloud.database().collection('categories').get()
    assert.ok(res.data instanceof Array)
    assert.ok(res.data.length)
    assert.ok(res.data[0].id)
  })


  it('read with $like should be ok', async () => {
    const cloud = client.init(config)
    const db = cloud.database()
    const _ = db.command
    const res = await db.collection('categories')
      .where({ name: _.like('%category%')}).get()

    assert.ok(res.data instanceof Array)
    assert.ok(res.data.length)
    assert.ok(res.data[0].id)
  })
})

