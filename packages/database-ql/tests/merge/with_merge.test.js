
const { Request } = require('./node_modules/less-api-client/dist/commonjs/request')

const { Db } = require('../../dist/commonjs/index')

// 这里使用 less-framework 来进行测试，请自行启动 less-framework 服务
function getAccessToken() {
  return 'eyJ1aWQiOiI2MDU1YTJhYWYyODhhNzQyNjEyNjA1MmYiLCJyb2xlcyI6W10sInR5cGUiOiJhZG1pbiIsImV4cGlyZSI6MTYxNjgzMzU0NzY5Mn0=.a5d3f03fbef1c228aef9a31427beef60'
}
Db.reqClass = Request
Db.getAccessToken = getAccessToken

const db = new Db({
  entryUrl: 'http://localhost:8080/admin/entry',
  getAccessToken: getAccessToken
})


describe('Db merge', async () => {

  it('with & merge', async () => {
    const res = await db.collection('admins')
      .withOne({
        query: db.collection('base_user'),
        localField: 'uid',
        foreignField: '_id',
      })
      .merge({ intersection: true })

    for (let data of res.data) {
      console.log(data)
    }
  })

  // it('withOne & merge (sub query withOne)', async () => {
  //   const sub_query = db.collection('user_role')
  //     .field(['uid', 'role_id'])
  //     .withOne({
  //       query: db.collection('role'),
  //       localField: 'role_id',
  //       foreignField: 'id',
  //       as: 'info'
  //     })

  //   const res = await db.collection('admin')
  //     .withOne({
  //       query: sub_query,
  //       localField: 'uid',
  //       foreignField: 'uid',
  //       as: 'role',
  //     })
  //     .merge()

  //   for (let data of res.data) {
  //     console.log(data)
  //   }
  // })
})