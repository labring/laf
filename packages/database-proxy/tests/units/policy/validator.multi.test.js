const assert = require('assert')
const {  Policy } = require('../../../dist')

describe('db-proxy(unit): validator::multi - [multi config as true]', () => {
    const rules = {
        categories: {
            "read": {},
            "update": {
                multi: true
            },
            "add": {
                multi: "true"
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    it('.read should be ok', async () => {
        const params = {
            collection: 'categories',
            action: 'database.queryDocument',
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('.update should be ok', async () => {
        const params = {
            collection: 'categories',
            action: 'database.updateDocument',
            data: {
                title: 'test-title',
            },
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('.add should be ok', async () => {
        const params = {
            collection: 'categories',
            action: 'database.addDocument',
            data: {
                title: 'test-title',
            },
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(matched)
        assert.ok(!errors)
    })
})

describe('db-proxy(unit): validator::multi - [multi config as false]', () => {
    const rules = {
        categories: {
            "read": {
                multi: false
            },
            "update": {
                multi: false
            },
            "add": {
                multi: "false"
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    it('.read should be ok', async () => {
        const params = {
            collection: 'categories',
            action: 'database.queryDocument',
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length === 1)
        assert.equal(errors[0].type, 'multi')
        assert.equal(errors[0].error, 'multi operation denied')
    })

    it('.update should be ok', async () => {
        const params = {
            collection: 'categories',
            action: 'database.updateDocument',
            data: {
                title: 'test-title',
            },
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length === 1)
        assert.equal(errors[0].type, 'multi')
        assert.equal(errors[0].error, 'multi operation denied')
    })

    it('.add should be ok', async () => {
        const params = {
            collection: 'categories',
            action: 'database.addDocument',
            data: {
                title: 'test-title',
            },
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length === 1)
        assert.equal(errors[0].type, 'multi')
        assert.equal(errors[0].error, 'multi operation denied')
    })

    it('.add should be rejected while data is array and multi given false', async () => {
        const params = {
            collection: 'categories',
            action: 'database.addDocument',
            data: [
                {
                    title: 'test-title'
                },
                {
                    title: 'test-title-2',
                }
            ],
            multi: false
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length === 1)
        assert.equal(errors[0].type, 'multi')
        assert.equal(errors[0].error, 'multi insert operation denied')
    })

    it('.add should be rejected while data is array and multi given true', async () => {
        const params = {
            collection: 'categories',
            action: 'database.addDocument',
            data: [
                {
                    title: 'test-title'
                },
                {
                    title: 'test-title-2',
                }
            ],
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {})
        assert.ok(!matched)
        assert.ok(errors.length === 1)
        assert.equal(errors[0].type, 'multi')
        assert.equal(errors[0].error, 'multi operation denied')
    })
})


describe('db-proxy(unit): validator::multi - [multi config as expression]', () => {
    const rules = {
        categories: {
            "remove": {
                multi: "$uid === query.created_by"
            }
        }
    }

    const ruler = new Policy()
    ruler.load(rules)

    it('remove should be ok', async () => {
        const params = {
            collection: 'categories',
            action: 'database.deleteDocument',
            query: {
                created_by: 1,
            },
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {$uid: 1})
        assert.ok(matched)
        assert.ok(!errors)
    })

    it('.remove should be rejected', async () => {
        const params = {
            collection: 'categories',
            action: 'database.deleteDocument',
            query: {
                created_by: 2,
            },
            multi: true
        }

        const { matched, errors } = await ruler.validate(params, {$uid: 1})
        assert.ok(!matched)
        assert.ok(errors.length === 1)
        assert.equal(errors[0].type, 'multi')
        assert.equal(errors[0].error, 'multi operation denied')
    })
  
})