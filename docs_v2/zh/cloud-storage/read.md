
# 在云函数中读文件

在云函数中操作云存储，需要提前创建一个存储桶（Bucket），以下示例使用 `data` 存储桶演示上传文件操作，请提前创建该存储桶。

## 读文件

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 读文件
  const stream = await bucket.readFile('index.html')

  // 转换为字符串
  const data = await stream.transformToString()

  console.log(data)
}
```

## 读文件为 Buffer

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 读文件
  const stream = await bucket.readFile('index.html')

  // 转换为 Buffer
  const bytes = await stream.transformToByteArray()
  const buffer = Buffer.from(bytes)

  console.log(buffer)
}
```

## 读文件并通过 HTTP 响应

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 读文件
  const stream = await bucket.readFile('index.html')

  // 通过 HTTP 流式响应
  ctx.response.chunkedEncoding = true
  ctx.response.setHeader('Content-Type', 'octet/stream')
  ctx.response.setHeader('Content-Disposition', 'attachment; filename="index.html"')

  stream.pipe(ctx.response)
}
```

