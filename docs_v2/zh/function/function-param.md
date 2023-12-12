---
title: 云函数参数 返回值
---

# {{ $frontmatter.title }}

## 参数

在 `main` 函数中，可以通过第一个参数 `ctx` 来获取用户传递的请求信息。
下面的例子可以读取前端传递的 Query 参数`username`：

```js
export default async function (ctx: FunctionContext) {
  return `hello, ${ctx.query.username}`;
};
```

这样可以读取前端传递的 body 参数

```js
export default async function (ctx: FunctionContext) {
  return `hello, ${ctx.body}`;
};
```

`ctx` 具有下面的一些内容：

| 属性            | 介绍                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| `ctx.requestId` | 当前请求的唯一 ID                                                                   |
| `ctx.method`    | 当前请求的方法，如`GET`、`POST`                                                     |
| `ctx.headers`   | 所有请求的 headers                                                                  |
| `ctx.auth`      | 使用 Http Bearer Token 认证时，解析出的 token 值                                    |
| `ctx.query`     | 当前请求的 query 参数                                                               |
| `ctx.body`      | 当前请求的 body 参数                                                                |
| `ctx.response`  | HTTP 响应，和`express`的`Response`实例保持一致                                      |
| `ctx.socket`    | [WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) 实例        |
| `ctx.files`     | 上传的文件 ([File](https://developer.mozilla.org/zh-CN/docs/Web/API/File) 对象数组) |

## 返回值

那我们如何把数据传给前端呢？很简单，只需要在云函数中 return 出去就可以了。

```js
export default async function (ctx: FunctionContext) {
  // 这里用字符串示例，你可以返回任何数据类型。
  return "这里是返回给前端的数据"
};
```
