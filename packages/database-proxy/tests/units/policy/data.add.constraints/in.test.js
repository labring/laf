const assert = require('assert')
const { Policy } = require('../../../../dist/policy')


describe('db-proxy(unit): validator::data - in', () => {
    const rules = {
        categories: {
            "add": {
                condition: true,
                data: { 
                    title: { in: [true, false]},
                    content: { in: ['China', 'Russia'] }
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.addDocument'
    }


    it('empty data should be rejected', async () => {
        params.data = {
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors)
    })

    it('valid data should be ok ', async () => {
        params.data = {
            title: false,
            content: 'China'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('invalid data should return an error ', async () => {
        params.data = {
            content: 'invalid value'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
    })

    it('invalid data for boolean value should return an error ', async () => {
        params.data = {
            title: 1,
            content: 'China'
        }
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
    })
})