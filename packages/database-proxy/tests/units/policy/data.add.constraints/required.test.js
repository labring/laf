const assert = require('assert')
const { Policy } = require('../../../../dist/policy')

describe('db-proxy(unit): validator::data - required', () => {
    const rules = {
        categories: {
            "add": {
                condition: true,
                data: { 
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
        collection: 'categories', action: 'database.addDocument'
    }


    it('data == undefined should be rejected', async () => {
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'data is undefined')
    })

    it('data is not object should be rejected', async () => {
        params.data = "invalid type"
        
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'data must be an object')
    })

    it('required == true should be ok', async () => {
        params.data = {
            title: 'Title'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('empty data should be rejected', async () => {
        params.data = {
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'data is empty')
    })

    it('required == true should be rejected', async () => {
        params.data = {
            content: 'Content'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'title is required')
    })

    it('required == false should be ok', async () => {
        params.data = {
            title: 'Title',
            content: 'Content',
            author: 'Author'
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })
})
