const assert = require('assert')
const { Policy } = require('../../../../dist/policy')


describe('db-proxy(unit): validator::data - length', () => {
    const rules = {
        categories: {
            "add": {
                condition: true,
                data: { 
                    title: { length: [3, 6], required: true},
                    content: { length: [3, 6]}
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.addDocument'
    }


    it('length == min should be ok', async () => {
        params.data = {
            title: 'abc'
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('length == max should be ok', async () => {
        params.data = {
            title: '123456'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('length < min should be rejected', async () => {
        params.data = {
            title: 'ab'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'length of title should >= 3 and <= 6')
    })
    

    it('length > max should be rejected', async () => {
        params.data = {
            title: '1234567'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'length of title should >= 3 and <= 6')
    })

    it('length < min && require == false should be rejected', async () => {
        params.data = {
            title: 'good',
            content: 'a'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.equal(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'length of content should >= 3 and <= 6')
    })
})
