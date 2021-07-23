import * as crypto from 'crypto'

exports.main = async function (ctx: any) {
  console.log(ctx)
  console.log(crypto)
  return 'ok'
}


// tsc --lib es6 -t ES2017 -m commonjs --pretty index.ts