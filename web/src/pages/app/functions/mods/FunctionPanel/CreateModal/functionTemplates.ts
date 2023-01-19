const functionTemplates = [
  {
    label: "hello laf",
    value: `import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  console.log('Hello World')
  return { data: 'hi, laf' }
}

`,
  },
  {
    label: "database 示例",
    value: `import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {

  const res = await cloud.database().collection('test').getOne();

  console.log(res);

  return { data: res }
}
`,
  },
];

export default functionTemplates;
