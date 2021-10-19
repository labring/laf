const assert = require('assert')
const {  MongoAccessor } = require('../../dist')

const MongoClient = require('mongodb').MongoClient

describe('db-proxy(unit): class Accessor', () => {
    it('constructor() ok', () => {
        const acc = new MongoAccessor('test-db', 'mongodb://localhost:27017')
        assert.equal(acc.db_name, 'test-db')
        assert.equal(acc.db, null)
        assert.ok(acc.conn instanceof MongoClient)
    })
})