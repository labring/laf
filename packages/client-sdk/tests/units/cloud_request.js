const assert = require('assert')
const { Cloud } = require('../../dist/commonjs/index')
const { Request } = require('../../dist/commonjs/request')


class CustomRequest extends Request {

  // 允许自定义 Request， 例如客户端加密请求的场景
  async request(data) {
    const str = JSON.stringify(data)
    const encrypt = Buffer.from(str).toString('base64')

    return {
      data: {
        code: 1,
        error: encrypt
      }
    }
  }
}

describe('Cloud request', function () {
  const config = {
    entryUrl: 'http://localhost:8080/admin/entry',
    getAccessToken: () => '',
    requestClass: function (config) { return new CustomRequest(config) }
  }

  it('database() should be ok', async () => {
    const cloud = new Cloud(config)
    const db = cloud.database()

    const r = await db.collection('test').get()
    assert.ok(r.code)
    assert.ok(r.error)
  })
})