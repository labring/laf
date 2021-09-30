const assert = require('assert')
const {  Ruler } = require('../../../../dist/ruler/ruler_v1')

describe('Date Validator - merge options', () => {
    const rules = {
        categories: {
            ".add": {
                condition: true,
                data: { 
                    title: { required: true },
                    content: {},
                    author: { required: false }
                }
            }
        }
    }

    const ruler = new Ruler()
    ruler.load(rules)

    let params = {
        collection: 'categories', action: 'database.addDocument'
    }

    it('add one while operator exists should throw error', async () => {
        params.data = {
            title: 'test-title',
            $set: {
                content: 'content'
            }
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'data must not contain any operator')
    })
})
