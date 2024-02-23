


# HTTP 请求

本节介绍云函数处理 HTTP 请求相关的用法。

::: info 本节目录
[[toc]]
:::

## 获取查询参数

```typescript
export default async function (ctx: FunctionContext) {
  const id = ctx.query.id
  console.log(id)
}
```

::: info
`ctx.query` 为 `Object` 类型，可直接获取到查询参数，详见 [req.query](https://expressjs.com/en/api.html#req.query)。
:::

## 获取请求体

```typescript
export default async function (ctx: FunctionContext) {
  const body = ctx.body
  console.log(body)
}
```

::: info
`ctx.body` 为 `Object` 类型，可直接获取到请求体，详见 [req.body](https://expressjs.com/en/api.html#req.body)。
:::


## 获取客户端 IP 地址

```typescript
export default async function (ctx: FunctionContext) {
  const ip = ctx.headers['x-forwarded-for']
  return `你的 IP 是：${ip}`
}

```

## 获取请求对象

```typescript
export default async function (ctx: FunctionContext) {
  const req = ctx.request

  console.log(req.url)      // 获取请求的 url
  console.log(req.path)     // 获取请求 path
  console.log(req.hostname) // 获取请求 hostname
}
```

::: details 查看输出
```text
/test?id=1
/test
c07iol.laf.dev
```
:::

`ctx.request` 请求对象，是一个 `express.js` 的 `Request` 对象，详见 [Express.js 文档](https://expressjs.com/en/api.html#req)。

## 下一步
::: tip
- [HTTP 响应](./response.md)
- [HTTP 认证](./auth.md)
- [处理文件上传](./files.md)
- [发起网络请求](./fetch.md)
:::


