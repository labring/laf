
const { Db } = require('../dist/commonjs/index')


Db.reqClass = function (config) {
  this.config = config
  this.send = async (action, params) => {
    console.log(action, params)
    return {
      code: 0,
      data: {
        list: []
      },
      query: params.query
    }
  }
}

const db = new Db({
  entryUrl: 'http://localhost:8080/admin/entry',
  getAccessToken: () => ''
})


describe('Db', async () => {


  it('geo should be ok', async () => {
    const point = new db.Geo.Point(40, 50)
    console.log(point)
    await db.collection('users')
      .where({
        pos: db.command.geoNear({
          geometry: point,
          maxDistance: 1000,
          minDistance: 0
        })
      })
      .get()
  })

  it('aggregate', async () => {
    const $ = db.command.aggregate
    const r = await db.collection('users').aggregate()
      .group({
        _id: '$username',
        total: $.sum('$age')
      })
      .end()
    
    console.log(r)
  })
})