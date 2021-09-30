const assert = require('assert')
const client = require('../../dist/commonjs/index')

const config = {
  entryUrl: 'http://localhost:8088/entry',
  getAccessToken: () => '',
}

describe('Database sql', function () {
  it('left join should be ok', async () => {
    const cloud = client.init(config)

    // 此种写法没有指定 projection，返回的结果中子表的同名字段会覆盖主表
    const res = await cloud.database().collection('articles')
      .leftJoin('categories', 'id', 'category_id')
      .get()
    
    assert.ok(res.data instanceof Array)
    assert.ok(res.data.length)
    assert.ok(res.data[0].id)
  })


  it('left join with projection passed', async () => {
    const cloud = client.init(config)
    const db = cloud.database()

    const res = await db.collection('articles')
      .leftJoin('categories', 'id', 'category_id')
      .field(['articles.*','categories.name', 'categories.name cate_name'])
      .get()
    
    assert.ok(res.data instanceof Array)
    assert.ok(res.data.length)
    assert.ok(res.data[0].id)
    assert.ok(res.data[0].name)
    assert.ok(res.data[0].cate_name)
  })
})

