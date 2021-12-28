---
title: 云数据库简介
---

### 介绍

前端可使用 [laf-client-sdk](https://github.com/lafjs/laf/tree/main/packages/client-sdk) “直连”数据库，无需与服务端对接口。

通过在开发控制台，配置相应的访问策略，即可实现客户端安全操作数据库。
详见[访问策略](./policy)。

### 安装客户端 SDK

在前端项目中安装 laf-client-sdk sdk:

```shell
npm install laf-client-sdk
```

### 使用示例

```js
const cloud = require("laf-client-sdk").init({
  // the laf app server base url
  baseUrl: "http://localhost:8000",
  // the database proxy entry, `app` is the policy name which response for the security of database access
  dbProxyUrl: "/proxy/app",
  // provide your own token-get-function, a standard JWT token is expected
  getAccessToken: () => localStorage.getItem("access_token"),
  /**
   * client runtime environment, default is 'h5':
   * - `h5` for browsers
   * - `wxmp` for WeChat MiniProgram
   * - `uniapp` for uni-app
   */
  environment: "h5",
});

// get a db instance
const db = cloud.database();

// query documents
const res = await db.collection("categories").get();

// query a document
const res = await db.collection("categories").doc("the-doc-id").get();

// query with options
const res = await db
  .collection("articles")
  .where({})
  .orderBy({ createdAt: "asc" })
  .offset(0)
  .limit(20)
  .get();

// count documents
const { total } = await db
  .collection("articles")
  .where({ createdBy: "the-user-id" })
  .count();

// update document
const res = await db.collection("articles").doc("the-doc-id").update({
  title: "new-title",
});

// add a document
const res = await db.collection("articles").add({
  title: "less api database",
  content: "less api more life",
  createdAt: new Date("2019-09-01"),
});

// delete a document
const res = await db.collection("articles").doc("the-doc-id").remove();
```
