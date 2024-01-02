

# HTTP 响应

本节介绍云函数处理 HTTP 响应相关的用法。

::: info 本节目录
[[toc]]
:::

## 返回文本

```typescript
export default async function (ctx: FunctionContext) {
  return 'hello world'
}
```

## 返回 JSON

```typescript
export default async function (ctx: FunctionContext) {
  return {
    code: 0,
    message: 'success'
  }
}
```

## 返回 HTML

```typescript
export default async function (ctx: FunctionContext) {
  ctx.response.setHeader('Content-Type', 'text/html')
  return '<h1>hello world</h1>'
}
```

## 返回状态码

```typescript
export default async function (ctx: FunctionContext) {
  ctx.response.status(404)
  return 'Not Found'
}
```

## 返回重定向

```typescript
export default async function (ctx: FunctionContext) {
  ctx.response.redirect('https://laf.run')
}
```


## 流式响应

```typescript
import { createReadStream } from 'node:fs'

export default async function (ctx: FunctionContext) {
  const response = ctx.response
  response.chunkedEncoding = true

  const stream = createReadStream('package.json')
  stream.on('data', chunk => {
    response.write(chunk)
  })
  
  stream.on('end', () => {
    response.end()
  })
}
```


## 返回 Cookie
  
```typescript
export default async function (ctx: FunctionContext) {
  ctx.response.cookie('session_id', 'abc123')
  return 'hello world'
}
```

## 下一步
::: tip
- [HTTP 请求](./request.md)
- [HTTP 认证](./auth.md)
- [处理文件上传](./files.md)
- [发起网络请求](./fetch.md)
:::


