const assert = require('assert')
const {  Ruler } = require('../../../../dist/ruler/ruler_v2')

describe('Query Validator - default', () => {
    const rules = {
        categories: {
            "update": {
                condition: true,
                query: { 
                    title: { default: 'Default Title', required: true},
                    content: { default: 0 }
                }
            }
        }
    }

    const ruler = new Ruler()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.updateDocument'
    }


    it('default should be applied both required equals to true and false', async () => {
        params.query = {
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)

        assert.equal(params.query.title, 'Default Title')
        assert.equal(params.query.content, 0)
    })

    it('given value should replace default value', async () => {
        params.query = {
            title: 'Custom Title'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)

        assert.equal(params.query.title, 'Custom Title')
        assert.equal(params.query.content, 0)
    })

    it('given value should replace default value both required == true and false', async () => {
        params.query = {
            title: 'Custom Title',
            content: 'Custom Content'
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)

        assert.equal(params.query.title, 'Custom Title')
        assert.equal(params.query.content, 'Custom Content')
    })
})