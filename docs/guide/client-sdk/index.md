---
title: laf-client-sdk
---

# {{ $frontmatter.title }}

## 介绍
laf 为前端提供了 `laf-client-sdk` 适用于任何 js 运行环境。

## 安装

```bash
 npm install laf-client-sdk
```

## 使用示例 
```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  // 这里 APPID 需要换成对应的 APPID
  baseUrl: "https://APPID.laf.run",
  // 这里是访问策略的入口地址，如果没有访问策略可不填
  dbProxyUrl: "/proxy/app",
  // 请求时带的token，可空
  getAccessToken: () => localStorage.getItem("access_token"),
});
```

微信小程序中使用
```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => localStorage.getItem("access_token"),
  environment: "wxmp",
});
```

UNI-APP 中使用
```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => localStorage.getItem("access_token"),
  environment: "uniapp",
});
```
                                        
## 调用云函数

```ts
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => localStorage.getItem("access_token"),
});

// 调用 getCode 云函数，并且传入参数
const res = await cloud.invoke("getCode", { phone: phone.value });
```

## 操作数据库

```ts
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => localStorage.getItem("access_token"),
});
// 获取用户表中的数据。
const res = await db.collection('user').get()
```

:::tip
通过 client SDK 我们可以像在云函数中一样操作数据库，更多操作情参考 云数据库 章节。  
还有就是需要配合相对应的访问策略。
:::