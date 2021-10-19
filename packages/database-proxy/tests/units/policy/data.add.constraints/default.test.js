const assert = require('assert')
const { Policy } = require('../../../../dist/policy')



describe('db-proxy(unit): validator::data - default', () => {
    const rules = {
        categories: {
            "add": {
                condition: true,
                data: { 
                    title: { default: 'Default Title', required: true},
                    content: { default: 0 }
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.addDocument'
    }


    it('default should be applied both required equals to true and false', async () => {
        params.data = {
            content: ''
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)

        assert.equal(params.data.title, 'Default Title')
        assert.equal(params.data.content, 0)
    })

    it('given value should replace default value', async () => {
        params.data = {
            title: 'Custom Title'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)

        assert.equal(params.data.title, 'Custom Title')
        assert.equal(params.data.content, 0)
    })

    it('given value should replace default value both required == true and false', async () => {
        params.data = {
            title: 'Custom Title',
            content: 'Custom Content'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)

        assert.equal(params.data.title, 'Custom Title')
        assert.equal(params.data.content, 'Custom Content')
    })
})
