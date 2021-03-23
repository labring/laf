
const path = require('path')
const assert = require('assert')
const { FunctionEngine } = require('../../dist/lib/faas/index')
const { handler } = require('./func')


describe("FaaS Engine", () => {

  it("constructor", async () => {
    const engine = new FunctionEngine()
    assert(engine instanceof FunctionEngine)
  })

  it("run code", async () => {
    const engine = new FunctionEngine()

    const code = handler.toString()
    const ret = await engine.run(code, {})
    assert.strictEqual(ret, 'ok')
  })

})