---
title: 云函数用法
---

# {{ $frontmatter.title }}

## 云函数参数

在 `main` 函数中，可以通过参数 `ctx` 来获取用户传递的请求信息。
下面的例子可以读取前端传递的 `Query` 参数`username`：

![function-query](/doc-images/function-query.png)

云函数代码如下：

```js
export function main(ctx: FunctionContext) {
  console.log(ctx.query.username)
};
```

还可以读取前端 HTTP 请求传递的 `body` 参数`username`：

![function-query](/doc-images/function-body.png)

云函数代码如下：

```js
export function main(ctx: FunctionContext) {
  console.log(ctx.body.username)
};
```

`ctx` 具有下面的一些参数：

| 属性            | 介绍                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| `ctx.requestId` | 当前请求的唯一 ID                                                                   |
| `ctx.method`    | 当前请求的方法，如`GET`、`POST`                                                     |
| `ctx.headers`   | 所有请求的 headers                                                                  |
| `ctx.user`      | 使用 Http Bearer Token 认证时，解析出的 token 值                                    |
| `ctx.query`     | 当前请求的 query 参数                                                               |
| `ctx.body`      | 当前请求的 body 参数                                                                |
| `ctx.request`  | HTTP 响应，和`express`的`Request`实例保持一致                                      |
| `ctx.response`  | HTTP 响应，和`express`的`Response`实例保持一致                                      |
| `ctx.socket`    | [WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) 实例，[Laf WebSocket 使用文档](/guide/function/websocket.html)      |
| `ctx.files`     | 上传的文件 ([File](https://developer.mozilla.org/zh-CN/docs/Web/API/File) 对象数组) |

## 云函数返回值

那我们如何把数据返回出去呢？

### 方法 1：return

很简单，只需要在云函数中 return 出去就可以了

```js
export function main (ctx: FunctionContext) {
  // 这里用字符串示例，你可以返回任何数据类型。
  return "这里是返回给前端的数据"
};
```

云函数的返回值支持多种类型：

```js
return Buffer.from("whoop"); // Buffer
return {
  some: "json";
} // 对象，会被处理成 JSON
return ("<p>some html</p>"); // HTML
return ("Sorry, we cannot find that!"); // 字符串
```

### 方法 2: ctx.response 设置响应头、状态码和响应体等信息

这里 `ctx.response` 对齐 `express` 框架的 `Response` 实例

以下是一些常见的 response 对象方法：

```js
ctx.response.setHeader(name, value) // 设置一个响应头
ctx.response.send(body) // 发送响应体，可以是一个字符串、一个 Buffer 对象、一个 JSON 对象、一个数组等
ctx.response.json(body) // 发送一个 JSON 响应
ctx.response.status(statusCode) // 设置 HTTP 响应的状态码
...
```

如果需要发送状态码，则需要使用 `ctx.response.status` ：

```js
ctx.response.status(403); // 发送 403 状态码
```

如果需要分段发送数据，则需要使用 `ctx.response.write` 和 `ctx.response.end` ：

例如：

```js
export function main (ctx: FunctionContext) {
  // 设置响应头
  ctx.response.type = 'text/html';
  ctx.response.status = 200;
  // 写入数据块
  ctx.response.write('<html><body>');
  ctx.response.write('<h1>Hello, world!</h1>');
  ctx.response.write('</body></html>');
  // 结束响应
  ctx.response.end();
};
```

## 支持异步操作

在实际应用中，云函数需要执行的异步操作（如网络请求，数据库操作等）。

幸运的是，云函数本身是支持异步调用的，你只需要在函数的前面加上 `async` ，就能轻松的让函数支持异步操作

新建云函数时默认已经在 main 函数的前面加上 `async`

:::tip
在云函数中执行异步操作，尽可能的使用 `await` 去等待执行完成
:::

如下面的例子，去查询数据库中的 user 集合

```js
import cloud from '@lafjs/cloud'
const db = cloud.database()

export default async function (ctx: FunctionContext) {
  // 在数据库等异步操作前面添加 await
  const res = await db.collection('user').get()
  // 同步操作无需添加 await
  console.log(res.data) 
};
```

## 云函数引入

现可直接在云函数中引入另外一个云函数

::: tip
被引入的云函数需要发布后，才可以被引入
:::

引入写法：

```js
// funcName 为 default 函数
import funcName from '@/funcName'
// 引入名为 func 的函数
import { func } from '@/funcName'
```

如：在`test`云函数中引入`util`云函数

```js
// util 云函数
export default async function main () {
  return "util 已引入"
};

export function add(a: number, b: number) {
  return a + b
};
```

```js
// test 云函数
import util, { add } from '@/util'

export async function main(ctx: FunctionContext) {
  // 由于 util 的 default 方法是 async 的，所以需要加 await
  console.log(await util())
  // 打印结果："util 已引入"
  console.log(add(1, 2))
  // 打印结果：3
}
```
