const assert = require('assert')
const { Processor } = require('../../../dist')
const {  Policy } = require('../../../dist/policy')

const buildins = require('../../../dist/validators')

describe('db-proxy(unit): class Policy', () => {

    it('loadBuiltins() ok', () => {
        // 初始化 validator 是否正确
        const ruler = new Policy()
        const validtrs = ruler.validators

        assert.equal(Object.keys(buildins).length, Object.keys(validtrs).length)
        for (let name in buildins) {
            const _names = Object.keys(validtrs)
            assert.ok(_names.includes(name))
            assert.equal(buildins[name], validtrs[name])
        }
    })

    it('register() ok', () => {
        const ruler = new Policy()
        ruler.register('test', (config, context) => {
            return true
        })
        assert.ok(ruler.validators['test'])
        assert.ok(ruler.validators['test'] instanceof Function)
        assert.ok(ruler.validators['test']())
    })

    it('load() ok', () => {
        const rules = {
            categories: {
                "read": true,
                "update": "false",
            }
        }
        const ruler = new Policy()
        ruler.load(rules)

        const r = ruler.rules.categories
        assert.ok(r)
        assert.ok(r['read'])
        assert.ok(r['update'])
        assert.ok(!r['add'])
        assert.ok(r['read'] instanceof Array)

        const v = r['read'][0]

        assert.ok(v)
        assert.ok(v.condition instanceof Processor)
        assert.equal(v.condition.name, 'condition')
        assert.equal(v.condition.type, 'validator')
        assert.equal(v.condition.config, 'true')
        assert.ok(v.condition.handler instanceof Function)
    })

    it('load() should throw unknown validator error', () => {
        const rules = {
            categories: {
                "read": {
                    'unknown-validator': 'for-test'
                },
            }
        }
        const ruler = new Policy()
        assert.throws(() => ruler.load(rules))
    })
})

describe('db-proxy(unit): class Policy validate() - condition', () => {
    const rules = {
        categories: {
            "read": true,
            "update": "$admin === true",
            "add": {
                condition: "$admin === true"
            },
            "remove": "$admin === true"
        }
    }

    const ruler = new Policy()
    ruler.load(rules)
    const injections = {
        $admin: true
    }

    let params = {
        collection: 'categories', action: 'database.queryDocument'
    }

    it('read should be ok', async () => {
        params.action = 'database.queryDocument'
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('update should be ok', async () => {
        params.action = 'database.updateDocument'
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('add should be ok', async () => {
        params.action = 'database.addDocument'
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('remove should be ok', async () => {
        params.action = 'database.deleteDocument'
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('read should be rejected', async () => {
        rules.categories['read'] = false
        const ruler = new Policy()
        ruler.load(rules)
        const injections = { $admin: false }
        const params = { collection: 'categories', action: 'database.queryDocument', injections }
        
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'condition')
    })

    it('update should be rejected', async () => {
        const injections = { $admin: false }
        const params = { collection: 'categories', action: 'database.updateDocument', injections }

        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'condition')
    })

    it('add should be rejected', async () => {
        const injections = { $admin: false }
        const params = { collection: 'categories', action: 'database.addDocument', injections }
    
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'condition')
    })

    it('remove should be rejected', async () => {
        const injections = { $admin: false }
        const params = { collection: 'categories', action: 'database.deleteDocument', injections }
    
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'condition')
    })

    it('invalid categories given should be rejected', async () => {
        const injections = { $admin: true }
        const params = { collection: 'invalid_categories', action: 'database.deleteDocument', injections }
        
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 0)
    })

    it('invalid action given should be rejected', async () => {
        const injections = { $admin: true }
        const params = { collection: 'categories', action: 'invalid.database.deleteDocument', injections }
        
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 0)
    })
})


describe('db-proxy(unit): class Policy validate() - multiple rules', () => {
    const rules = {
        categories: {
            "read": [
                { condition: "$role === 'admin'" },
                { condition: "$role === 'product'"},
                { condition: "$role === 'market'"}
            ]
        }
    }
    const ruler = new Policy()
    ruler.load(rules)

    it('injections with { $role: "admin" } should be ok', async () => {
        const injections = { $role: 'admin' }
        const params = { collection: 'categories', action: 'database.queryDocument', injections}
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('injections with { $role: "product" } should be ok', async () => {
        const injections = { $role: 'product' }
        const params = { collection: 'categories', action: 'database.queryDocument', injections}
        
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('injections with { $role: "market" } should be ok', async () => {
        const injections = { $role: 'market' }
        const params = { collection: 'categories', action: 'database.queryDocument', injections}
        
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it("injections with { $role: 'other' } should be rejected", async () => {
        const injections = { $role: 'other' }
        const params = { collection: 'categories', action: 'database.queryDocument', injections}
        
        const { errors, matched} = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors.length, 3)
        assert.equal(errors[0].type, 'condition')
    })
})