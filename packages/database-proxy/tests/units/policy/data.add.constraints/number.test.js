const assert = require('assert')
const { Policy } = require('../../../../dist/policy')

describe('db-proxy(unit): validator::data - number', () => {
    const rules = {
        categories: {
            "add": {
                condition: true,
                data: { 
                    total: { number: [0, 100] },
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.addDocument'
    }


    it('number == min should be ok', async () => {
        params.data = {
            total: 0
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('number == max should be ok', async () => {
        params.data = {
            total: 100
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('number < min should be rejected', async () => {
        params.data = {
            total: -1
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'total should >= 0 and <= 100')
    })
    

    it('number > max should be rejected', async () => {
        params.data = {
            total: 101
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'total should >= 0 and <= 100')
    })
})

