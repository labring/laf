const assert = require('node:assert/strict')
const test = require('node:test')

const { handleResponseError } = require('../dist/util/request')

test('preserves Axios errors that do not have an HTTP response', async (t) => {
  const messages = []
  t.mock.method(console, 'error', (message) => messages.push(message))

  const networkError = Object.assign(new Error('socket hang up'), {
    code: 'ECONNRESET',
    config: {
      method: 'get',
      url: 'https://api.example.test/v1/apps/app/dependencies',
    },
  })

  await assert.rejects(handleResponseError(networkError), (error) => {
    assert.equal(error, networkError)
    return true
  })
  assert.deepEqual(messages, [
    'Request failed before receiving a response (ECONNRESET): GET https://api.example.test/v1/apps/app/dependencies',
    'socket hang up',
  ])
})
