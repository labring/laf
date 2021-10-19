const assert = require('assert')
const { Policy } = require('../../../../dist/policy')

describe('db-proxy(unit): validator::query - in', () => {
    const rules = {
        categories: {
            "update": {
                condition: true,
                query: { 
                    title: { in: [true, false]},
                    content: { in: ['China', 'Russia'] }
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.updateDocument'
    }


    it('empty query should be ok', async () => {
        params.query = {
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('valid query should be ok ', async () => {
        params.query = {
            title: false,
            content: 'China'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('invalid query should return an error ', async () => {
        params.query = {
            content: 'invalid value'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'query')
    })

    it('invalid query for boolean value should return an error ', async () => {
        params.query = {
            title: 1,
            content: 'China'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'query')
    })
})
