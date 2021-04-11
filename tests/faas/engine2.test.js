

const { FunctionEngine } = require('../../dist/lib/faas/engine2')

const code = `
import * as path from 'path'
exports.main = async function (ctx) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx

  console.log(path.basename)
  return 'ok'
}
`

const code2 = `
import * as path from 'path'
export async function main (ctx) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx

  console.log(path.basename)
  return 'ok'
}
`

async function main()  {
    const engine = new FunctionEngine()

    const ret = await engine.run(code2, {})
    console.log(ret)
}

main()