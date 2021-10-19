const assert = require('assert')
const { Policy } = require('../../../../dist/policy')

describe('db-proxy(unit): validator::query - condition', () => {
    const rules = {
        categories: {
            "update": {
                query: { 
                    author_id: "$userid == $value",
                    createdBy: {
                        condition: "$userid == $v"
                    }
                }
            }
        }
    }

    const ruler = new Policy()
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

    it('query condition should be ok', async () => {
        params.query = {
            author_id: 123
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