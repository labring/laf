const { Db } = require('../../dist/commonjs/index')
const Actions = {
  add: 'database.addDocument',
  get: 'database.queryDocument',
  update: 'database.updateDocument',
  count: 'database.countDocument',
  remove: 'database.deleteDocument',
  aggregate: 'database.aggregateDocuments'
}

class MockRequest {

  action = null
  params = null

  /**
   * 
   * @param {string} action 
   * @param {any} params 
   * @returns
   */
  async send(action, params) {
    let data = {}
    this.action = action
    this.params = params
    
    if (action === Actions.add) {
      data = { _id: '0', insertedCount: 0 }
    }
    
    if (action === Actions.get || action === Actions.aggregate) {
      data = { list: [] }
    }

    if (action === Actions.count) {
      data = { total: 0 }
    }

    if (action === Actions.update) {
      data = { updated: 1, upsert_id: '0' }
    }

    if (action === Actions.remove) {
      data = { deleted: 1 }
    }

    if (action === Actions.add) {
      data = { _id: '0', insertedCount: 1 }
    }
    
    return {
      code: 0,
      requestId: 'test_req_id',
      data
    }
  }
}


// mock db
function getDb() {
  const req = new MockRequest()
  const db = new Db({ request: req })
  return { db, req }
}

module.exports = {
  MockRequest,
  Actions,
  getDb
}