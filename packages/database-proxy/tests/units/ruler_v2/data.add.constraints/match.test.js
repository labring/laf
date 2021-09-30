const assert = require('assert')
const {  Ruler } = require('../../../../dist/ruler/ruler_v2')



describe('Data Validator - match', () => {
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

    const ruler = new Ruler()
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
