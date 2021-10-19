const assert = require('assert')
const {  Policy } = require('../../../../dist')

describe('db-proxy(unit): validator::data - default(update)', () => {
    const rules = {
        categories: {
            "update": {
                condition: true,
                data: { 
                    title: { default: 'Default Title', required: true},
                    content: { default: 0 },
                    another: {}
                }
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.updateDocument'
    }

    // it('default should not be applied both required equals to true and false when update', async () => {
    //     params.data = {
    //         another: ''
    //     }
    //     const { matched, errors } = await ruler.validate(params, {})
    //     assert.ok(matched)
    //     assert.ok(!errors)

    //     // 更新时默认值应该失效，虽必填
    //     assert.notStrictEqual(params.data.title, 'Default Title')
    //     // 更新时默认值应该失效，不必填
    //     assert.ok(!params.data.content)
    // })

    it('given value should replace default value', async () => {
        params.data = {
            title: 'Custom Title'
        }
        const { matched, errors } = await ruler.validate(params, {})

        assert.ok(matched)
        assert.ok(!errors)

        assert.equal(params.data.title, 'Custom Title')
        assert.ok(!params.data.content)
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
