const assert = require('assert')
const { Policy } = require('../../../../dist/policy')

describe('db-proxy(unit): validator::data - condition', () => {
    const rules = {
        categories: {
            "add": {
                condition: true,
                data: { 
                    author_id: "$userid == $value",
                    createdBy: {
                        condition: "$userid == $value"
                    }
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.addDocument'
    }

    it('data condition should be ok', async () => {
        params.data = {
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

    it('data condition should be rejected', async () => {
        params.data = {
            author_id: 1,
            createdBy: 2
        }
        
        const injections = {
            $userid: 123
        }
        
        const { matched, errors } = await ruler.validate(params, injections)
        assert.ok(!matched)
        assert.ok(errors)
        assert.equal(errors[0].type, 'data')
    })
})