const defaultString = `import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {

  const { auth, body, query } = ctx

  return { hello: 'LaF'}
}

`;

export default defaultString;
