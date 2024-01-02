---
title: 云函数 SDK
---

# {{ $frontmatter.title }}

引入 Laf 的 Cloud SDK

在云函数上，Laf 提供了专门的 SDK `@lafjs/cloud` 让云函数支持访问网络、数据库、对象存储等。

::: danger
`@lafjs/cloud` 是一个专有的模块，只能在云函数上使用，不支持通过 npm 安装到其他位置。
:::

## 导入 SDK

每个 Laf 应用默认已经安装了 SDK 依赖，不需要额外安装了。直接在云函数顶部 import 即可。

```js
import cloud from "@lafjs/cloud";
```

## SDK 属性

`cloud` 具有下面的一些参数：

| 属性            | 介绍                                                                                |
| --------------- | ----------------------------------------------------------------------------------- |
| `cloud.appid` | 当前 Laf 应用的 appid                                                                  |
| `cloud.database()`    | 当前应用的数据库对象                                                     |
| `cloud.fetch`      | 可在云函数中发起 HTTP 请求，基于`axios`封装                                    |
| `cloud.getToken`     |  生成 JWT Token                                                               |
| `cloud.parseToken`      |  解密 JWT Token                                                                |
| `cloud.shared`  |  当前应用的全局缓存                                      |
| `cloud.mongo`    | 当前应用的原生 MongoDB 实例      |
| `cloud.sockets`     | 当前应用的所有 socket 连接|

## 发送网络请求

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

## 操作数据库

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

## 云函数鉴权

云函数鉴权可以使用 JWT Token，下方是生成和解密 JWT token 的方法

```typescript
cloud.getToken(payload)   // payload 可参考下方的示例代码
cloud.parseToken(token)   // token 为前端请求时 header 里的 authorization 中的 token
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

## 云函数全局缓存

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
  cloud.shared.set(key, val); // 设置一个缓存
  cloud.shared.get(key); // 获取缓存的值
  cloud.shared.has(key); // 判断缓存是否存在
  cloud.shared.delete(key); // 删除缓存
  cloud.shared.clear(); // 清空所有缓存
  // ... 其他方法可访问上方 MDN 的 Map 文档查看
};
```

## 云函数原生 MongoDriverObject 实例

熟悉 MongoDB 的同学建议优先使用原生 MongoDriverObject 实例去操作数据库。

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
