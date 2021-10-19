const assert = require('assert')
const { Policy } = require('../../../../dist/policy')



describe('db-proxy(unit): validator::data - match', () => {
    const rules = {
        categories: {
            "add": {
                condition: true,
                data: { 
                    account: { match: "^\\d{6,10}$" },
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.addDocument'
    }


    it('match should be ok', async () => {
        params.data = {
            account: '1234567'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('match invalid value should return an error', async () => {
        params.data = {
            account: 'abc'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'account had invalid format')
    })
})
