const assert = require('assert')
const { DefaultLogger } = require('../../../dist')
// const { Processor } = require('../../../dist')
const {  Policy } = require('../../../dist/policy')


describe('class Policy validate() - schema', () => {
    const rules = {
        categories: {
            read: true,
            update: "$admin === true",
            add: {
                condition: "$admin === true"
            },
            remove: "$admin === true",
            $schema: { 
                title: { required: true, length: [1, 10] },
                author: { required: false}
            }
        }
    }

    const ruler = new Policy()
    ruler.setLogger(new DefaultLogger(0))
    ruler.load(rules)
    const injections = {
        $admin: true
    }

    let params = {
        collection: 'categories', action: 'database.queryDocument'
    }

    it('read should be ok', async () => {
        params.action = 'database.queryDocument'
        const { errors, matched } = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('update should be ok', async () => {
        params.action = 'database.updateDocument'
        const p = {
            ...params,
            data: {
                title: 'abc'
            }
        }
        const { errors, matched } = await ruler.validate(p, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })


    it('add should be ok', async () => {
        params.action = 'database.addDocument'
        const p = {
            ...params,
            data: {
                title: 'abc'
            }
        }
        const { errors, matched} = await ruler.validate(p, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })
})