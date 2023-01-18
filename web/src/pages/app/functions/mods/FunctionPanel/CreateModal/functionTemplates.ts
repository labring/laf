const functionTemplates = [
  {
    label: "hello laf",
    value: `import cloud from '@lafjs/cloud'

exports.main = async function (ctx: FunctionContext) {
  console.log('Hello World')
  return { data: 'hi, laf' }
}
`,
  },
  {
    label: "database 示例",
    value: `import cloud from '@lafjs/cloud'

exports.main = async function (ctx: FunctionContext) {

  // you should add a collection named 'test' first
  const res = await cloud.database().collection('test').getOne();

  console.log(res);

  return { data: res }
}
`,
  },
];

export default functionTemplates;
