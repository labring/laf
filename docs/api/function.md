---
title: 云函数API文档
---

# {{ $frontmatter.title }}

## 云函数签名

```ts
(ctx: FunctionContext) => any;
```

## FunctionContext

云函数执行时提供的上下文

| 属性            | 类型                                                                      | 介绍                                             |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| `ctx.requestId` | `string`                                                                  | 当前请求的唯一 ID                                |
| `ctx?.method`   | `string`                                                                  | 当前请求的方法，如`GET`、`POST`                  |
| `ctx?.headers`  | `import('http').IncomingHttpHeaders`                                      | 所有请求的 headers                               |
| `ctx?.auth`     | `{ uid: string }`                                                         | 使用 Http Bearer Token 认证时，解析出的 token 值 |
| `ctx.query`     | `import('qs').ParsedQs`                                                   | 当前请求的 query 参数                            |
| `ctx.body`      | `any`                                                                     | 当前请求的 body 参数                             |
| `ctx.response`  | `import('express').Response`                                              | HTTP 响应，和`express`的`Response`实例保持一致   |
| `ctx.socket`    | [`WebSocket`](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) | WebSocket 实例                                   |
| `ctx.files`     | [`File[]`](https://developer.mozilla.org/zh-CN/docs/Web/API/File)         | 上传的文件对象数组)                              |
