const assert = require('assert')
const { Policy } = require('../../../../dist/policy')

describe('db-proxy(unit): validator::query - match', () => {
    const rules = {
        categories: {
            "update": {
                condition: true,
                query: { 
                    account: { match: "^\\d{6,10}$" },
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.updateDocument'
    }


    it('match should be ok', async () => {
        params.query = {
            account: '1234567'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('match invalid value should return an error', async () => {
        params.query = {
            account: 'abc'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'query')
        assert.equal(errors[0].error, 'account had invalid format')
    })
})
