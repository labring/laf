---
title: 云函数参数 返回值
---

# {{ $frontmatter.title }}


## 参数

在 `main` 函数中，可以通过第一个参数 `ctx` 来获取用户传递的请求信息。     
下面的例子可以读取前端传递的 Query 参数`username`：

```js
export function main(ctx: FunctionContext) {
  console.log(ctx.query.username)
};
```

这样可以读取前端传递的 body 参数
```js
export function main(ctx: FunctionContext) {
  console.log(ctx.body)
};
```

`ctx` 具有下面的一些内容：

| 属性            | 介绍                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| `ctx.requestId` | 当前请求的唯一 ID                                                                   |
| `ctx.method`    | 当前请求的方法，如`GET`、`POST`                                                     |
| `ctx.headers`   | 所有请求的 headers                                                                  |
| `ctx.user`      | 使用 Http Bearer Token 认证时，解析出的 token 值                                    |
| `ctx.query`     | 当前请求的 query 参数                                                               |
| `ctx.body`      | 当前请求的 body 参数                                                                |
| `ctx.response`  | HTTP 响应，和`express`的`Response`实例保持一致                                      |
| `ctx.socket`    | [WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) 实例        |
| `ctx.files`     | 上传的文件 ([File](https://developer.mozilla.org/zh-CN/docs/Web/API/File) 对象数组) |
| `ctx.env`       | 自定义的环境变量 ([env](env.md))                                                    |

## 返回值

那我们如何把数据传给前端呢？很简单，只需要在云函数中 return 出去就可以了。   
```js
export function main (ctx: FunctionContext) {
  // 这里用字符串示例，你可以返回任何数据类型。
  return "这里是返回给前端的数据"
};
```

云函数的返回值支持多种类型：

```js
Buffer.from("whoop"); // Buffer
{
  some: "json";
} // 对象，会被处理成JSON
("<p>some html</p>"); // HTML
("Sorry, we cannot find that!"); // 字符串
```

如果需要发送状态码，则需要使用 `ctx` 对象上的 `response` 属性：

```js
ctx.response.status(403); // 发送403状态码
```

## 异步的云函数

在实际应用中，云函数需要执行的异步操作（如网络请求）。

幸运的是，云函数本身是支持异步调用的，你只需要在函数的前面加上 `async` ，就能轻松的让函数支持异步操作：

```js
export async function main (ctx: FunctionContext) (ctx) {
  await someAsyncAction;
  return `hello, ${ctx.query.username}`;
};
```

## Cloud SDK

刚刚编写的一些云函数都是比较基础的一些功能，并没有和 Laf 的其他功能连接起来。

在云函数上，Laf 提供了云 SDK `@lafjs/cloud` 让云函数支持访问网络、数据库、对象存储等。

::: warning
`@lafjs/cloud` 是一个专有的模块，只能在云函数上使用，不支持通过 npm 安装到其他位置。
:::

### 导入 SDK

SDK 的所有内容通过它的默认导出来访问。

```js
import cloud from "@lafjs/cloud";
```
### 发送网络请求

使用 `cloud.fetch()` 可发起 HTTP 请求，调用三方接口，可完成如支付接口、短信验证码等等三方接口操作。

该接口是对 `axios` 请求库的封装，其调用方法与 `axios` 完全一致。

```ts
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

### 操作数据库

通过`cloud.database()` 可以获取数据库对象，进而对数据库进行操作。

::: info
数据库 API 的详细操作方法可以参考 _云数据库_ 章节
:::

下面的例子可以获取数据库中的用户信息：

```ts
import cloud from "@lafjs/cloud";

export async function main(ctx: FunctionContext) {
  const { username } = ctx.body;
  // 数据库操作
  const db = cloud.database();
  const ret = await db.collection("users").where({ username }).get();

  console.log(ret);
  return ret.data;
};
```

### 调用其他云函数

通过`cloud.invoke()` 调用本应用内的其他云函数。

```ts
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
   // 调用 hello 云函数
   await cloud.invoke('hello')
}
```
如果调用的云函数需要用到 ctx 里面的东西，我们可以通过这样的方式传入。
```ts
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
   // 调用云函数 hello 并传入 ctx
   await cloud.invoke('hello',ctx)
}
```

### 生成 JWT token

以下实现简单登录函数，以演示 标准 JWT token 的生成，预期开发者已熟悉 JWT 相关知识。

可查看[JSON Web Token 入门教程](https://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

> 注意：出于演示目的，对 password 以明文方式查询，并未做 hash 处理考虑，不建议实际开发过程中如此使用。

```ts
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

### 操作缓存数据

::: info
云函数全局内存单例对象，可跨多次调用、不同云函数之间共享数据
`cloud.shared`是 JS 中标准的 Map 对象，可参照 MDN 文档学习使用：[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

使用场景：

1. 可将一些全局配置初始化到 shared 中，如微信开发信息、短信发送配置
2. 可共享一些常用方法，如 checkPermission 等，以提升云函数性能
3. 可做热数据的缓存。如：缓存微信 access_token。（建议少量使用，此对象是在 node vm 堆中分配，因为 node vm 堆内存限制）
   :::

```ts
import cloud from "@lafjs/cloud";

export async function main(ctx: FunctionContext) {
  await cloud.shared.set(key, val); // 设置一个缓存
  await cloud.shared.get(key); // 获取缓存的值
  await cloud.shared.has(key); // 判断缓存是否存在
  await cloud.shared.delete(key); // 删除缓存
  await cloud.shared.clear(); // 清空所有缓存
  // ... 其他方法可访问上方MDN的Map文档查看
};
```