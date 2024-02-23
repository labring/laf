

# 云函数快速入门

本节通过给出几个简单的云函数示例，快速展示云函数的能力和用法。

::: tip
你可以在 `https://laf.run` 上创建一个应用，然后创建函数来调试这些云函数代码。
:::

::: info 本节目录
[[toc]]
:::

## Hello World

```typescript
export default async function (ctx: FunctionContext) {
  console.log('Hello World')
  return 'hi, laf'
}
```

这个最简单的云函数，打印一条日志 `Hello World`，并返回 `hi, laf` 做为其响应内容。
通过浏览器访问其地址即可看到 `hi, laf`。

## 获取请求参数

```typescript
export default async function (ctx: FunctionContext) {
  // 获取请求参数
  console.log(ctx.query)

  // 获取客户端的 IP 地址
  const ip = ctx.headers['x-forwarded-for']

  return `你的 IP 地址是：${ip}`
}
```

## 响应 JSON 对象

```typescript
export default async function (ctx: FunctionContext) {
  // ...

  return {
    code: 'success',
    message: '操作成功',
    data: []
  }
}
```

## 访问数据库

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function (ctx: FunctionContext) {
  // 新增数据
  await db.collection('users').insertOne({
    username: 'laf',
    created_at: new Date()
  })

  // 查询数据
  const users = await db.collection('users')
    .find()
    .toArray()

  return users
}
```

## 发起 HTTP 请求

```typescript
export default async function (ctx: FunctionContext) {
  const res = await fetch('https://laf.run/v1/regions')
  const obj = await res.json()
  return obj
}
```

## 下一步
::: tip
- [HTTP 请求](./request.md)
- [HTTP 响应](./response.md)
- [HTTP 认证](./auth.md)
- [处理文件上传](./files.md)
- [发起网络请求](./fetch.md)
- [云数据库](../cloud-database/index.md)
- [云存储](../cloud-storage/index.md)
- [函数引用](./import.md)
- [环境变量](./env.md)
:::










