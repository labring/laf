---
title: 云函数简介
---

### 简介

云函数是运行在云端的 JavaScript 代码，熟悉 Node.js 的开发者可以直接上手。

云函数可使用 Typescript 编写，无需管理服务器，在开发控制台在线编写、在线调试、一键保存即可运行后端代码。

在你的应用中，大多数数据的获取都可在客户端直接操作数据库，但是通常业务中会使用到「非数据库操作」，如注册、登录、文件操作、事务、第三方接口等，可直接使用云函数实现。

以下是一个云函数示例：

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

### 客户端调用云函数

```js
import { Cloud } from 'laf-client-sdk'

const cloud = new Cloud({
  baseUrl: "https://APPID.lafyun.com",
  getAccessToken: () => localStorage.getItem('access_token')
})

const ret = await cloud.invokeFunction("login", {
  username: "maslow"
});

console.log(ret);
```
