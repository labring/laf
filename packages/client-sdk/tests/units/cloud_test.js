const assert = require('assert')
const client = require('../../dist/commonjs/index')
const { Request } = require('../../dist/commonjs/request')
const Db = client.Db

function getAccessToken(){
  return 'test-token-xxx'
}

describe('Cloud', function () {
  const config = {
    entryUrl: 'http://localhost:8080/entry',
    getAccessToken
  }

  it('init() should be ok', () => {
    const cloud = client.init(config)

    assert.ok(cloud instanceof client.Cloud)
    assert.equal(cloud.config.entryUrl, config.entryUrl)
    assert.equal(cloud.config.getAccessToken, getAccessToken)
  })

  it('database() should be ok', () => {
    const cloud = client.init(config)
    const db = cloud.database()

    assert.ok(db instanceof Db)
    assert.equal(db.config.entryUrl, config.entryUrl)
    assert.equal(db.config.getAccessToken, config.getAccessToken)

    assert.equal(Db.getAccessToken, getAccessToken)
  })
})