
const ts = require('typescript')

const source = `
import * as crypto from 'crypto'

exports.main = async function (ctx: any) {
  console.log(ctx)
  console.log(crypto)
  return 'ok'
}
`

const result = ts.transpile(source, {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017
})

console.log(result)