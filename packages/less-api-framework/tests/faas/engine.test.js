
const path = require('path')
const assert = require('assert')
const { FunctionEngine } = require('../../dist/lib/faas/engine')
const ts = require('typescript')


const source = `
import * as crypto from 'crypto'

exports.main = async function (ctx: any) {
  console.log(ctx)
  console.log(crypto)
  return 'ok'
}
`

const source2 = `
import * as crypto from 'crypto'

export async function main (ctx: any) {
  console.log(ctx)
  console.log(crypto)
  return 'ok'
}
`

describe("FaaS Engine", () => {

  it("constructor", async () => {
    const engine = new FunctionEngine()
    assert(engine instanceof FunctionEngine)
  })

  it("run code 1", async () => {
    const engine = new FunctionEngine()

    const result = ts.transpile(source2, {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2017
    })

    const code = result
    const ret = await engine.run(code, {
      context: {}
    })
    assert.strictEqual(ret.data, 'ok')
  })

  it("run code 2", async () => {
    const engine = new FunctionEngine()

    const result = ts.transpile(source2, {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2017
    })

    const code = result
    const ret = await engine.run(code, {
      context: {}
    })
    assert.strictEqual(ret.data, 'ok')
  })

})