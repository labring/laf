const assert = require('assert')
const { MongoAccessor } = require('../../dist')

const { MongoClient, Db } = require('mongodb')

describe('db-proxy(unit): class Accessor', () => {
  it('constructor() ok', () => {
    const client = new MongoClient('mongodb://localhost:27017/test-db')
    const acc = new MongoAccessor(client)
    assert.ok(acc.db instanceof Db)
    assert.ok(acc.client instanceof MongoClient)
  })
})
