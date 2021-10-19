const assert = require('assert')
const { Policy } = require('../../../../dist/policy')


describe('db-proxy(unit): validator::query - required', () => {
    const rules = {
        categories: {
            "update": {
                condition: true,
                query: { 
                    title: { required: true },
                    content: {},
                    author: { required: false }
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.updateDocument'
    }


    it('query == undefined should be rejected', async () => {
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length, 1)
        assert.equal(errors[0].type, 'query')
        assert.equal(errors[0].error, 'query is undefined')
    })

    it('query is not object should be rejected', async () => {
        params.query = "invalid type"
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length, 1)
        assert.equal(errors[0].type, 'query')
        assert.equal(errors[0].error, 'query must be an object')
    })

    it('required == true should be ok', async () => {
        params.query = {
            title: 'Title'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('empty query should be rejected', async () => {
        params.query = {
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'query')
        assert.equal(errors[0].error, 'title is required')
    })

    it('required == true should be rejected', async () => {
        params.query = {
            content: 'Content'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'query')
        assert.equal(errors[0].error, 'title is required')
    })

    it('required == false should be ok', async () => {
        params.query = {
            title: 'Title',
            content: 'Content',
            author: 'Author'
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })
})
