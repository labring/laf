---
title: 云函数 Cloud SDK
---

### 云函数 Cloud SDK

在云函数中，`laf.js` 提供了一个 `cloud-sdk` 以方便开发者访问一些应用接口，如数据库、文件、网络等接口。

#### 数据库访问

在云函数中数据库操作 与客户端 SDK 的数据库操作的接口是一致的，前端人员也可以无缝的编写云函数，或者复用代码。

```ts
// 引入 cloud-sdk，注意以 `@/` 开头
import cloud from "@/cloud-sdk";

exports.main = async function (ctx) {
  const { username } = ctx.body;
  // 数据库操作
  const db = cloud.database()
  const ret = await db.collection("users").where({ username }).get()

  console.log(ret)
  return ret.data
}
```

#### HTTP 请求

使用 `cloud.fetch()` 可发起 HTTP 请求，调用三方接口，可完成如支付接口、短信验证码等等三方接口操作。

该接口是对 `axios` 请求库的封装，其调用方法与 `axios` 完全一致。

```ts
import cloud from "@/cloud-sdk";

exports.main = async function (ctx) {
  const ret = await cloud.fetch({
    url: "http://www.baidu.com/",
    method: "post",
  })

  console.log(ret.data)
  return ret.data
};
```

### 生成 JWT token

以下实现简单登录函数，以演示 标准 JWT token 的生成，预期开发者已熟悉 JWT 相关知识。

可查看[JSON Web Token 入门教程](https://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

> 注意：出于演示目的，对 password 以明文方式查询，并未做 hash 处理考虑，不建议实际开发过程中如此使用。

```ts
import cloud from "@/cloud-sdk";

exports.main = async function (ctx) {
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

#### 附：SDK 接口定义

`Cloud SDK` 还提供了其它能力，可参考其内部定义，同时在开发控制台中编写时，亦有代码提示、类型、注释提示，可根据代码提示使用。

````ts
export interface CloudSdkInterface {
  /**
   * 发送 HTTP 请求，实为 Axios 实例，使用可直接参考 axios 文档
   */
  fetch: AxiosStatic;

  /**
   * 获取 less api database ORM 实例
   */
  database(): Db;
  /**
   * 调用云函数
   */
  invoke: InvokeFunctionType;
  /**
   * 抛出云函数事件，其它云函数可设置触发器监听此类事件
   */
  emit: EmitFunctionType;
  /**
   * 云函数全局内存单例对象，可跨多次调用、不同云函数之间共享数据
   * 1. 可将一些全局配置初始化到 shared 中，如微信开发信息、短信发送配置
   * 2. 可共享一些常用方法，如 checkPermission 等，以提升云函数性能
   * 3. 可做热数据的缓存，建议少量使用（此对象是在 node vm 堆中分配，因为 node vm 堆内存限制）
   */
  shared: Map<string, any>;
  /**
   * 获取 JWT Token，若缺省 `secret`，则使用当前服务器的密钥做签名
   */
  getToken: GetTokenFunctionType;
  /**
   * 解析 JWT Token，若缺省 `secret`，则使用当前服务器的密钥做签名
   */
  parseToken: ParseTokenFunctionType;
  /**
   * 当前应用的 MongoDb Node.js Driver 实例对象。
   * 由于 Laf database ORM 对象只有部分数据操作能力，故暴露此对象给云函数，让云函数拥有完整的数据库操作能力：
   * 1. 事务操作
   * ```js
   *   const session = mongo.client.startSession()
   *   try {
   *     await session.withTransaction(async () => {
   *       await mongo.db.collection('xxx').updateOne({}, { session })
   *       await mongo.db.collection('yyy').deleteMany({}, { session })
   *       // ...
   *     })
   *   } finally {
   *     await session.endSession()
   *   }
   * ```
   * 2. 索引管理
   * ```js
   *    mongo.db.collection('admins').createIndex('username', { unique: true })
   * ```
   * 3. 聚合操作
   */
  mongo: MongoDriverObject;
}
````
