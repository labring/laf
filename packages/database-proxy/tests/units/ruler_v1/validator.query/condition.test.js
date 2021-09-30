const assert = require('assert')
const {  Ruler } = require('../../../../dist/ruler/ruler_v1')


describe('Query validator - condition', () => {
    const rules = {
        categories: {
            ".update": {
                condition: true,
                query: { 
                    author_id: "$userid == $value",
                    createdBy: {
                        condition: "$userid == $value"
                    }
                }
            }
        }
    }

    const ruler = new Ruler()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.updateDocument'
    }

    it('query condition should be ok', async () => {
        params.query = {
            author_id: 123,
            createdBy: 123
        }
        
        const injections = {
            $userid: 123
        }
        
        const { matched, errors } = await ruler.validate(params, injections)
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('query condition should be rejected', async () => {
        params.query = {
            author_id: 1,
            createdBy: 2
        }
        
        const injections = {
            $userid: 123
        }
        
        const { matched, errors } = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors[0].type, 'query')
    })
})