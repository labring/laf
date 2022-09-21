---
title: 云函数入门
---

# {{ $frontmatter.title }}

云函数是运行在云端的 JavaScript 代码。

云函数可使用 Typescript 编写，无需管理服务器，在开发控制台在线编写、在线调试、一键保存即可运行后端代码。

在你的应用中，大多数数据的获取都可在客户端直接操作数据库，但是通常业务中会使用到「非数据库操作」，如注册、登录、文件操作、事务、第三方接口等，可直接使用云函数实现。

## 第一个云函数

一个最简单的云函数只需要在模块中导出一个名为 `main` 的函数，如下面代码所示:

```js
exports.main = function () {
  return "hello world!";
};
```

当然，使用 ESModule 的语法也是可以的：

```js
export function main() {
  return "hello world!";
}
```

## 访问云函数

### 通过 URL 访问云函数

发布云函数后，可以在云函数列表中的"调用地址"获得云函数的访问地址。

使用浏览器或者 PostMan 等工具访问该地址，即可得到 `hello world!`字符串。

### 通过 SDK 访问云函数

除了通过 HTTP 请求来访问，还可以使用 [laf-client-sdk](https://www.npmjs.com/package/laf-client-sdk) 来访问云函数。

::: info
目前 SDK 暂时只支持发送 POST 请求
:::

首先，安装 SDK:

```shell
npm i laf-client-sdk
```

接下来，需要创建一个`cloud` 对象：

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "xxx", // 这个地址可以在欢迎页面中的“服务地址”中找到
  getAccessToken: () => "", // 这里不需要授权，先填空
});
```

然后，就可以调用云函数了：

```js
const ret = await cloud.invokeFunction("helloworld");

console.log(ret); // hello world!
```

## 获取用户传递的参数

刚刚介绍的云函数只能静态地返回一些内容，但在实际场景下，我们需要让云函数能够和用户交互。

在 `main` 函数中，可以通过第一个参数 `ctx` 来获取用户传递的请求信息。

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

下面的例子可以读取用户传递的 Query 参数`username`：

```js
exports.main = function (ctx) {
  return `hello, ${ctx.query.username}`;
};
```

访问 `调用地址?username=test`，你将得到：

```js
hello, test;
```

::: warning
laf 现有对 `request` 请求体和请求流的大小限制是 10M(后期会做考虑做 laf 应用环境变量的管理)
:::

### 在客户端 SDK 调用带参数的云函数

`invokeFunction` 函数的第二个参数指明了用于发送的数据，这个数据会以 Body 的形式发送：

```js
const ret = await cloud.invokeFunction("函数名", { name: "test" });
```

## 异步的云函数

刚刚我们提到的云函数都是同步函数。但是，在实际应用中，云函数需要执行的异步操作（如网络请求）。

幸运的是，云函数本身是支持异步调用的，你只需要在函数的前面加上 `async` ，就能轻松的让函数支持异步操作：

```js
exports.main = async function (ctx) {
  await someAsyncAction;
  return `hello, ${ctx.query.username}`;
};
```

## 云函数的返回值

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

## 导入模块

我们可以很轻松地借助 ESModule 的 `import` 语法或 CommonJS 的 `require` 语法来导入模块。

::: warning
不建议使用 `require` 引入包，虽然也能运行，但在线 IDE 无法给出智能提示
:::

### 导入 Node.js 内置包

下面的例子使用了 Node.js 内置的包 `crypto`，来对密码进行哈希：

```ts
import cloud from "@/cloud-sdk";
import * as crypto from "crypto";

exports.main = async function (ctx) {
  const { password } = await ctx.body;

  const password_hash = crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");

  return password_hash;
};
```

### 导入 NPM 包

在使用 npm 包之前，需要在 _依赖管理_ 处安装对应的包。

```ts
import cloud from "@/cloud-sdk";
import * as dayjs from "dayjs";

exports.main = function () {
  return dayjs().format();
};
```

### 导入云函数

目前 Laf 暂不支持导入其他的云函数，敬请期待。

::: info
虽然不支持导入，但支持执行其他的云函数。
:::

## Cloud SDK

刚刚编写的一些云函数都是比较基础的一些功能，但并没有和 Laf 的其他功能连接起来。

在云函数上，Laf 提供了云 SDK `@/cloud-sdk` 让云函数支持访问网络、数据库、对象存储等。

::: warning
`@/cloud-sdk` 是一个专有的模块，只能在云函数上使用，不支持通过 npm 安装到其他位置。
:::

### 导入 SDK

SDK 的所有内容通过它的默认导出来访问。

```js
import cloud from "@/cloud-sdk";
```

### 发送网络请求

使用 `cloud.fetch()` 可发起 HTTP 请求，调用三方接口，可完成如支付接口、短信验证码等等三方接口操作。

该接口是对 `axios` 请求库的封装，其调用方法与 `axios` 完全一致。

```ts
import cloud from "@/cloud-sdk";

exports.main = async function (ctx) {
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
import cloud from "@/cloud-sdk";

exports.main = async function (ctx) {
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

下方例子演示了创建用户成功后为用户发送邀请邮件（`send_mail`函数需自行实现）：

```ts
import cloud from "@/cloud-sdk";

// invoke方法模型

exports.main = async function (ctx) {
const { username } = ctx.body;
  // 数据库操作
  const db = cloud.database();
  const ret = await db.collection("users").add({
    name: 'jack',
    password: '*******'
  });
  if (ret?.ok) {
    await cloud.invoke(
      'send_mail', 
      {
        ...ctx, // 如果函数内部需要使用ctx中的某些属性，可按此方法传入
        body: {
          title: 'xxx',
          content: 'xxx',
          date: 'xxx'
        }
      }
    )
  }
  
  console.log(ret);
  return ret.ok;
};
```

### 发送云函数事件

通过`cloud.emit()` 调用本应用内的其他云函数。

上面的例子演示了创建用户成功后为用户发送邀请邮件，但如果在用户创建成功后有许多操作要做（如同时发送欢迎邮件、欢迎短信、为邀请人分配奖励等），这样的操作显然不是很合适。使用`cloud.emit`可简化相关操作。

> 本例仅做`emit`示例使用，业务开发中可直接使用触发器监听`DatabaseChange:users#add`事件实现此功能。[查看详情](trigger.md)

```ts
import cloud from "@/cloud-sdk";

// invoke方法模型
// invoke<T>(name: string, ctx: FunctionContext): Promise<T>

exports.main = async function (ctx) {
const { username } = ctx.body;
  // 数据库操作
  const db = cloud.database();
  const ret = await db.collection("users").add({
    name: 'jack',
    password: '*******'
  });
  if (ret?.ok) {
    await cloud.emit(
      'user_created', 
      {
        ...ctx, // 如果函数内部需要使用ctx中的某些属性，可按此方法传入
        body: {
        	id: ret?.insertId
        }
      }
    )
  }
  
  console.log(ret);
  return ret.ok;
};
```
之后可在[触发器](trigger.md)处使用
![image](https://user-images.githubusercontent.com/27558572/191404414-7d69811e-b192-4d55-9a26-59829d9932aa.png)

在事件处填入你要监听的事件名称，当有云函数`emit`这个事件时，会自动执行这个云函数
![image](https://user-images.githubusercontent.com/27558572/191404535-700c43b4-3e1c-427a-a36d-4198e10dcc7d.png)

> 新建触发器后需要点击`新建函数`旁的`发布函数`发布后才会应用触发器。


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

### 操作缓存数据

::: info
云函数全局内存单例对象，可跨多次调用、不同云函数之间共享数据
`cloud.shared`是JS中标准的Map对象，可参照MDN文档学习使用：[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

使用场景：
1. 可将一些全局配置初始化到 shared 中，如微信开发信息、短信发送配置
2. 可共享一些常用方法，如 checkPermission 等，以提升云函数性能
3. 可做热数据的缓存。如：缓存微信access_token。（建议少量使用，此对象是在 node vm 堆中分配，因为 node vm 堆内存限制）
:::
```ts
import cloud from "@/cloud-sdk";

exports.main = async function (ctx) {
  await cloud.shared.set(key, val) // 设置一个缓存
  await cloud.shared.get(key) // 获取缓存的值
  await cloud.shared.has(key) // 判断缓存是否存在
  await cloud.shared.delete(key) // 删除缓存
  await cloud.shared.clear() // 清空所有缓存
  // ... 其他方法可访问上方MDN的Map文档查看
};
```
