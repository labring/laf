import { t } from "i18next";

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
    label: t("database example"),
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
  {
    label: t("upload example"),
    value: `import cloud from '@lafjs/cloud'
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";

exports.main = async function (ctx: FunctionContext) {
  const { auth, body, query } = ctx
  const ENDPOINT = cloud.env.OSS_EXTERNAL_ENDPOINT;
  const BUCKET = ""; // Create your bucket first

  const s3Client = new S3({
    region: cloud.env.OSS_REGION,
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: cloud.env.OSS_ACCESS_KEY,
      secretAccessKey: cloud.env.OSS_ACCESS_SECRET,
    },
    forcePathStyle: true,
  });

  const file = ctx.files[0]
  console.log(file)
  const stream = require('fs').createReadStream(file.path)
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: ctx.files[0].filename,
    Body: stream,
    ContentType: file.mimetype,
  })
  try {
    const data = await s3Client.send(cmd);
    return {
      success: true,
      fileName: ctx.files[0].filename,
    }
  } catch (err) {
    return { code: 500, err: err }
  }
}
    `,
  },
  {
    label: t("ChatGPT example"),
    value: `import cloud from '@lafjs/cloud'

    export async function main(ctx: FunctionContext) {
      const data = ctx.body
      const { ChatGPTAPI } = await import('chatgpt')
    
    
      let api = cloud.shared.get('api')
    
      if (!api) {
        // 这里需要填写你的apiKey
        api = new ChatGPTAPI({ apiKey: '' })
        cloud.shared.set('api', api)
      }
    
      ctx.response.setHeader('Content-Type', 'application/octet-stream');
    
      const obj = {
        onProgress: (partialResponse => {
          if (partialResponse && partialResponse.delta != undefined) {
            ctx.response.write(partialResponse.delta);
          }
        })
      }
    
      if (data.parentMessageId) {
        obj.parentMessageId = data.parentMessageId
      }
    
      const res = await api.sendMessage(data.message, obj)
    
      ctx.response.end("--!" + res.id)
    
      return res
    }
    `,
  },
];

export default functionTemplates;
