const assert = require('assert')
const { Policy } = require('../../../dist')

describe('db-proxy(unit): validator::join - [no join configured]', () => {
    const rules = {
        categories: {
            "read": true,
            "update": true,
            "add": true
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    it('.read with joins when no join configuration given should be rejected', async () => {
        const params = {
            collection: 'categories',
            action: 'database.queryDocument',
            joins: [
                { type: 'left', collection: 'left_tbl', leftKey: 'lid', rightKey: 'rid' }
            ]
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length)
        assert.strictEqual(errors[0].type, 'join')
    })

    it('.update with joins when no join configuration given should be rejected', async () => {
        const params = {
            collection: 'categories',
            action: 'database.updateDocument',
            joins: [
                { type: 'left', collection: 'left_tbl', leftKey: 'lid', rightKey: 'rid' }
            ]
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length)
        assert.strictEqual(errors[0].type, 'join')
        assert.strictEqual(errors[0].error, 'operation denied: only READ support join query')
    })
})


describe('db-proxy(unit): validator::join - [join configured]', () => {
    const rules = {
        categories: {
            "read": {
                join: ['sub_tbl1', 'sub_tbl2']
            },
            "update": {
                join: ['sub_tbl1']
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    it('.read with left joins should be ok', async () => {
        const params = {
            collection: 'categories',
            action: 'database.queryDocument',
            joins: [
                { type: 'left', collection: 'sub_tbl1', leftKey: 'lid', rightKey: 'rid' },
                { type: 'left', collection: 'sub_tbl2', leftKey: 'lid', rightKey: 'rid' },
            ]
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('.read with invalid joins should be rejected', async () => {
        const params = {
            collection: 'categories',
            action: 'database.queryDocument',
            joins: [
                { type: 'left', collection: 'another_tbl', leftKey: 'lid', rightKey: 'rid' }
            ]
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length)
        assert.strictEqual(errors[0].type, 'join')
        assert.strictEqual(errors[0].error, 'join query with another_tbl denied')
    })

    it('.read with non-left-join should be rejected', async () => {
        const params = {
            collection: 'categories',
            action: 'database.queryDocument',
            joins: [
                { type: 'inner', collection: 'sub_tbl1', leftKey: 'lid', rightKey: 'rid' }
            ]
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length)
        assert.strictEqual(errors[0].type, 'join')
        assert.strictEqual(errors[0].error, 'only left join supported by now')
    })

    it('.update with joins should be rejected', async () => {
        const params = {
            collection: 'categories',
            action: 'database.updateDocument',
            joins: [
                { type: 'left', collection: 'sub_tbl1', leftKey: 'lid', rightKey: 'rid' }
            ]
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length)
        assert.strictEqual(errors[0].type, 'join')
        assert.strictEqual(errors[0].error, 'operation denied: only READ support join query')
    })
})
