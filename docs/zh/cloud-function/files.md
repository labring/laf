

# 处理客户端上传的文件

本节介绍如何使用云函数处理客户端上传的文件。

::: info 本节目录
[[toc]]
:::

## 获取上传的文件对象

::: info
在客户端上传到云函数的文件，可以通过 `ctx.files` 获取到，其值是一个数组，支持上传多个文件。
:::

```typescript
export default async function (ctx: FunctionContext) {
  console.log(ctx.files)
}
```


::: info 输出结果
```typescript
[
  {
    fieldname: 'file',
    originalname: 'WWcBsfDKw45X965dd934f04a7b0a405467b91800d7ce.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: '/tmp',
    filename: 'e6feb0a3-85d7-4fe3-b9ae-78701146acd8.jpg',
    path: '/tmp/e6feb0a3-85d7-4fe3-b9ae-78701146acd8.jpg',
    size: 219043
  }
]
```
:::



## 读取客户端上传的文件

::: info
本例演示读取用户上传的文件内容。
:::

```typescript
import { readFile } from 'node:fs/promises'

export default async function (ctx: FunctionContext) {
  if (ctx.files.length === 0) {
    return 'no file found'
  }
  
  const file = ctx.files[0]
  const data = await readFile(file.path, 'utf8')
  console.log(data)
}
```

## 将客户端上传的文件保存到云存储

::: info
本例演示将客户端上传的文件保存到云存储中，需要你提前在 laf 控制台创建一个文件桶，本例中文件桶名假定为 `data`。
:::

```typescript
import cloud from '@lafjs/cloud'
import { createReadStream } from 'node:fs'

export default async function (ctx: FunctionContext) {
  if (ctx.files.length === 0) {
    return 'no file found'
  }

  const file = ctx.files[0]
  const stream = createReadStream(file.path)

  const bucket = cloud.storage.bucket('test')
  const res = await bucket.writeFile(file.originalname, stream, {
    ContentType: file.mimetype
  })

  return res
}
```

::: info 更多参考
操作云存储的详细用法，请参考[云存储上传文件](../cloud-storage/upload.md)。
:::

## 下一步
::: tip
- [HTTP 请求](./request.md)
- [HTTP 响应](./response.md)
- [HTTP 认证](./auth.md)
- [云存储](../cloud-storage/index.md)
- [发起网络请求](./fetch.md)
- [函数引用](./import.md)
:::

