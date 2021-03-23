

// example 1
exports.main = async function (ctx) {
  return 'haha'
}

// example 2
exports.handler = async function (ctx) {
  const {
    params,
    auth,
  } = ctx

  console.log(params)
  console.log(auth)
  console.log(ctx)
  return 'ok'
}
