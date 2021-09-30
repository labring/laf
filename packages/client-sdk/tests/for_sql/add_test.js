const assert = require('assert')
const client = require('../../dist/commonjs/index')

const config = {
  entryUrl: 'http://localhost:8088/entry',
  getAccessToken: () => '',
}

let category_id = null

describe('Database sql', function () {
  it('add one should be ok', async () => {
    const cloud = client.init(config)

    const result = await cloud.database()
      .collection('categories')
      .add({
        name: 'category-add'
      })

    console.log({ result })
    category_id = result.id

    const r = await cloud.database()
      .collection('categories')
      .where({id: result.id})
      .get()
    
    const data = r.data
    assert.ok(result.id)
    assert.equal(data[0].id, result.id)
  })

  it('add article should be ok', async () => {
    const cloud = client.init(config)

    const result = await cloud.database()
      .collection('articles')
      .add({
        title: 'article-add',
        category_id: category_id,
        content: 'article-content'
      })

    assert.ok(result.id)
  })

  it('add many categories should be rejected', async () => {
    const cloud = client.init(config)

    const res = await cloud.database()
      .collection('categories')
      .add([
        {
          name: 'category-add'
        },
        {
          name: 'category-add-2'
        }
      ], { multi: true })

    assert.ok(res.error?.length)
    assert.strictEqual(res.error[0].type, 'multi')
    assert.strictEqual(res.error[0].error, 'multi operation denied')
  })
})