
const Actions = {
  add: 'database.addDocument',
  get: 'database.queryDocument',
  update: 'database.updateDocument',
  count: 'database.countDocument',
  remove: 'database.deleteDocument'
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
    
    if (action === Actions.get) {
      data = { list: [] }
    }

    if (action === Actions.count) {
      data = { total: 0 }
    }

    if (action === Actions.update) {
      data = { updated: 0, upsert_id: '0' }
    }

    if (action === Actions.remove) {
      data = { deleted: 0 }
    }
    
    return {
      code: 0,
      requestId: 'test_req_id',
      data
    }
  }
}

module.exports = {
  MockRequest,
  Actions
}