
# 在云函数中上传文件

::: tip
在云函数中操作云存储，需要提前创建一个存储桶（Bucket），以下示例使用 `data` 存储桶演示上传文件操作，请提前创建该存储桶。
:::


## 上传文件

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 写文件
  const content = 'hello, laf'
  await bucket.writeFile('laf.html', content)
}
```


## 指定文件类型（MIME）

在上面的示例中，文件类型默认为 `application/octet-stream`，如果需要指定文件类型，可以在 `writeFile` 方法中传入 `options.ContentType` 参数：

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 写文件并指定文件类型为 text/html
  const content = 'hello, laf'
  await bucket.writeFile('index.html', content, {
    ContentType: 'text/html'
  })
}
```

更多文件类型请参考 [MIME Types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)。



## 上传文件流

```ts
import cloud from '@lafjs/cloud'
import { createReadStream } from 'node:fs'

export default async function (ctx: FunctionContext) {

  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 读文件流
  const stream = createReadStream('./package.json')

  // 写文件
  await bucket.writeFile('laf.json', stream, {
    ContentType: 'application/json'
  })
}
```

## 上传文件 Buffer

```ts
import cloud from '@lafjs/cloud'
import { readFile } from 'node:fs/promises'

export default async function (ctx: FunctionContext) {

  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 读文件 Buffer
  const buffer = await readFile('./package.json')

  // 写文件
  await bucket.writeFile('laf.json', buffer, {
    ContentType: 'application/json'
  })
}
```
