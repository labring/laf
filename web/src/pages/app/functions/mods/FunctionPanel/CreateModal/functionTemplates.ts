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

const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // insert data
  const insertRes = await db.collection('test').add({ name: "hello laf" })
  console.log(insertRes)
  if (insertRes.ok) {
    // get data
    const res = await db.collection('test').getOne()
    console.log(res)
    return res
  } else {
    return { data: insertRes.error }
  }
}
`,
  },
];

export default functionTemplates;
