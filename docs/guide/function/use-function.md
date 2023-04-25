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
| `ctx.env`       | 本应用自定义的环境变量 ([env](env.md))                                                    |

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

这里`ctx.response`对齐`express`框架的`Response`实例

以下是一些常见的 res 对象方法：

```js
ctx.response.send(body) // 发送响应体，可以是一个字符串、一个 Buffer 对象、一个 JSON 对象、一个数组等
ctx.response.json(body) // 发送一个 JSON 响应
ctx.response.status(statusCode) // 设置 HTTP 响应的状态码
ctx.response.setHeader(name, value) // 设置一个响应头
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

::: info
在云函数中执行异步操作，尽可能的使用 `await` 去等待执行完成
:::

如下面的例子，去查询数据库中的 user 集合

```js
import cloud from '@lafjs/cloud'
const db = cloud.database()

exports.main = async function (ctx: FunctionContext) {
  // 在数据库等异步操作前面添加 await
  const res = await db.collection('user').get()
  // 同步操作无需添加 await
  console.log(res.data) 
};
```

## 云函数引入

现可直接在云函数中引入另外一个云函数

::: info
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

## Laf 云函数 Cloud SDK

上面查询数据库的部分有引入 Laf 的 Cloud SDK

在云函数上，Laf 提供了专门的 SDK `@lafjs/cloud` 让云函数支持访问网络、数据库、对象存储等。

::: danger
`@lafjs/cloud` 是一个专有的模块，只能在云函数上使用，不支持通过 npm 安装到其他位置。
:::

### 导入 SDK

每个 Laf 应用默认已经安装了 SDK 依赖，不需要额外安装了。直接在云函数顶部 import 即可。

```js
import cloud from "@lafjs/cloud";
```

### 发送网络请求

使用 `cloud.fetch()` 可发起 HTTP 请求，调用三方接口，可完成如支付接口、短信验证码等等三方接口操作。

该接口是对 `axios` 请求库的封装，其调用方法与 `axios` 完全一致。调用方法可参考：[axios 文档](https://www.axios-http.cn/docs/api_intro)

可以理解为 `cloud.fetch === axios`，可以做到互相替换。

```typescript
import cloud from "@lafjs/cloud";

export async function main(ctx: FunctionContext) {
  const ret = await cloud.fetch({
    url: "http://api.github.com/",
    method: "post",
  });
  console.log(ret.data);
  return ret.data;
};
```

还可以这么写

```typescript
// get 请求
const getRes = await cloud.fetch.get("http://api.github.com/");
// post 请求
const postRes = await cloud.fetch.post("http://api.github.com/",{
  name: 'laf'
});
```

### 操作数据库

通过`cloud.database()` 可以获取数据库对象，进而对数据库进行操作。

::: info
数据库 API 的详细操作方法可以参考 _[云数据库](/guide/db/)_ 章节
:::

下面的例子可以获取数据库中的用户信息：

```typescript
import cloud from "@lafjs/cloud";

export async function main(ctx: FunctionContext) {
  const { username } = ctx.body;
  // 数据库操作
  const db = cloud.database();
  const ret = await db.collection("users").where({ username }).get();
  console.log(ret);
};
```

### 调用其他云函数

通过`cloud.invoke()` 调用本应用内的其他云函数。

::: info
该方法已不推荐使用，现可直接[引入云函数](#云函数引入)
:::

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
   // 调用 hello 云函数
   await cloud.invoke('hello')
}
```

如果调用的云函数需要用到 ctx 里面的东西，我们可以通过这样的方式传入。

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
   // 调用云函数 hello 并传入 ctx
   await cloud.invoke('hello',ctx)
}
```

### 生成和解密 JWT token

```typescript
cloud.getToken(payload); // payload 可参考下方的示例代码
cloud.parseToken(token); // token 为前端请求时 header 里的 authorization 中的 token
```

以下实现简单的生成和解密 JWT token

```js
import cloud from "@lafjs/cloud";

export async function main(ctx: FunctionContext)  {
  const payload = {
    uid: 1,
    // 默认 token 有效期为 7 天，请务必提供此 `exp` 字段，详见 JWT 文档。
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };
  // 生成 access_token
  const access_token = cloud.getToken(payload);
  console.log("云函数生成的 token：", access_token)
  // ctx.user 会自动解密
  console.log(ctx.user)
  const authHeader = ctx.headers.authorization;
  const token = authHeader.split(' ')[1]; // 提取 JWT
  console.log("前端请求带的 token：", token)
  const parseToken = cloud.parseToken(token);
  console.log("解密 token 后的数据：", parseToken)
};
```

![getToken-parseToken](/doc-images/getToken-parseToken.png)

以下实现简单登录函数，并生成 JWT token

> 注意：出于演示目的，对 password 以明文方式查询，并未做 hash 处理考虑，不建议实际开发过程中如此使用。

```typescript
import cloud from "@lafjs/cloud";

export async function main(ctx: FunctionContext)  {
  const { username, password } = ctx.body;

  const db = cloud.database();
  const { data: user } = await db
    .collection("users")
    .where({ username, password })
    .getOne();

  if (!user) {
    return "invalid username or password";
  }

  // payload of token
  const payload = {
    uid: user._id,
    // 默认 token 有效期为 7 天，请务必提供此 `exp` 字段，详见 JWT 文档。
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };
  const access_token = cloud.getToken(payload);

  return {
    access_token,
    uid: user._id,
    username: user.username,
    expired_at: payload.exp,
  };
};
```

### 云函数全局缓存

云函数全局内存单例对象，可跨多次调用、不同云函数之间共享数据

`cloud.shared`是 JS 中标准的 Map 对象，可参照 MDN 文档学习使用：[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

使用场景：

1. 可将一些全局配置初始化到 shared 中，如微信开发信息、短信发送配置
2. 可共享一些常用方法，如 checkPermission 等，以提升云函数性能
3. 可做热数据的缓存。如：缓存微信 access_token。（建议少量使用，此对象是在 node vm 堆中分配，因为 node vm 堆内存限制）

::: info
应用重启后缓存会全部清空，不重启会一直保留
:::

```typescript
import cloud from "@lafjs/cloud";

export async function main(ctx: FunctionContext) {
  await cloud.shared.set(key, val); // 设置一个缓存
  await cloud.shared.get(key); // 获取缓存的值
  await cloud.shared.has(key); // 判断缓存是否存在
  await cloud.shared.delete(key); // 删除缓存
  await cloud.shared.clear(); // 清空所有缓存
  // ... 其他方法可访问上方 MDN 的 Map 文档查看
};
```

### 云函数原生 MongoDriverObject 实例

可参照 mongodb 官方 crud 文档学习使用：[mongodb](https://www.mongodb.com/docs/mongodb-shell/crud/)

下面是一个简单的使用实例：

```typescript
import cloud from "@lafjs/cloud";

export async function main(ctx: FunctionContext) {
  const db = cloud.mongo.db
  const data = { 
    name : "张三"
  }
  const res = await db.collection('test').insertOne(data)
  console.log(res)
};
```
