const assert = require('assert')
const {  Policy } = require('../../../../dist')

describe('db-proxy(unit): validator::data - merge options (replace & update)', () => {
    const rules = {
        categories: {
            "update": {
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
        collection: 'categories', action: 'database.updateDocument'
    }

    it('replace one while operator exists and merge == false should throw error', async () => {
        params.data = {
            $set: {
                title: 'test-title',
                content: 'content'
            }
        }
        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length, 1)
        // console.log(errors)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'data must not contain any operator')
    })

    it('update one while operator NOT exists and merge == true should throw error', async () => {
        params.data = {
            title: 'test-title'
        }
        params.merge = true

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length, 1)
        assert.equal(errors[0].type, 'data')
        assert.equal(errors[0].error, 'data must contain operator while `merge` with true')
      })
})
