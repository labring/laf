import { t } from "i18next";

const functionTemplates = [
  {
    label: "hello laf",
    value: `import cloud from '@lafjs/cloud'
export default async function (ctx: FunctionContext) {
  console.log('Hello World')
  return { data: 'hi, laf' }
}
`,
  },
  {
    label: t("database example"),
    value: `import cloud from '@lafjs/cloud'
export default async function (ctx: FunctionContext) {
  const db = cloud.database()
  // insert data
  await db.collection('test').add({ name: "hello laf" })
  // get data
  const res = await db.collection('test').getOne()
  console.log(res)
  return res.data
}
`,
  },
  {
    label: t("upload example"),
    value: `import cloud from '@lafjs/cloud'
import { S3 } from "@aws-sdk/client-s3"
export default async function (ctx: FunctionContext) {
  // Create your bucket first
  const BUCKET = "kcqcau-test" 
  const client = new S3({
    region: cloud.env.OSS_REGION,
    endpoint: cloud.env.OSS_EXTERNAL_ENDPOINT,
    credentials: {
      accessKeyId: cloud.env.OSS_ACCESS_KEY,
      secretAccessKey: cloud.env.OSS_ACCESS_SECRET,
    },
    forcePathStyle: true,
  })
  const file = ctx.files[0]
  console.log(file)
  const stream = require('fs').createReadStream(file.path)
  const res = await client.putObject({
    Bucket: BUCKET,
    Key: ctx.files[0].filename,
    Body: stream,
    ContentType: file.mimetype,
  })
  console.log(res)
  return res
}
    `,
  },
  {
    label: t("ChatGPT example"),
    value: `import cloud from '@lafjs/cloud'
const apiKey = cloud.env.API_KEY
export default async function (ctx: FunctionContext) {
  const { ChatGPTAPI } = await import('chatgpt')
  const { body, response } = ctx
  // get chatgpt api
  let api = cloud.shared.get('api')
  if (!api) {
    api = new ChatGPTAPI({ apiKey })
    cloud.shared.set('api', api)
  }
  // set stream response type
  response.setHeader('Content-Type', 'application/octet-stream');
  // send message
  const res = await api.sendMessage(body.message, {
    onProgress: (partialResponse) => {
      if (partialResponse?.delta != undefined)
        response.write(partialResponse.delta)
    },
    parentMessageId: body.parentMessageId || ''
  })
  response.end("--!" + res.id)
}
    `,
  },
];

export default functionTemplates;
