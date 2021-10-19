const assert = require('assert')
const { Policy } = require('../../../../dist/policy')


describe('db-proxy(unit): validator::query - number', () => {
    const rules = {
        categories: {
            "update": {
                condition: true,
                query: { 
                    total: { number: [0, 100] },
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.updateDocument'
    }


    it('number == min should be ok', async () => {
        params.query = {
            total: 0
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('number == max should be ok', async () => {
        params.query = {
            total: 100
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('number < min should be rejected', async () => {
        params.query = {
            total: -1
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'query')
        assert.equal(errors[0].error, 'total should >= 0 and <= 100')
    })
    

    it('number > max should be rejected', async () => {
        params.query = {
            total: 101
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'query')
        assert.equal(errors[0].error, 'total should >= 0 and <= 100')
    })
})