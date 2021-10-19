const assert = require('assert')
const client = require('../../dist/commonjs/index')
const { Request } = require('../../dist/commonjs/request')
const Db = client.Db

function getAccessToken(){
  return 'test-token-xxx'
}

describe('client-sdk(unit): Cloud', function () {
  const config = {
    dbProxyUrl: 'http://localhost:8080/entry',
    getAccessToken
  }

  it('init() should be ok', () => {
    const cloud = client.init(config)

    assert.ok(cloud instanceof client.Cloud)
    assert.equal(cloud.config.dbProxyUrl, config.dbProxyUrl)
    assert.equal(cloud.config.getAccessToken, getAccessToken)
  })

  it('database() should be ok', () => {
    const cloud = client.init(config)
    const db = cloud.database()

    assert.ok(db instanceof Db)
  })
})