---
title: laf-client-sdk
---

# laf-client-sdk

## 介绍

laf 为前端提供了 `laf-client-sdk` 适用于前端 js 运行环境。

:::warning
优先推荐使用 HTTP 的方式请求云函数
:::

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
  // 请求时带的 token，可空
  getAccessToken: () => localStorage.getItem("access_token"),
});
```

## 参数

`baseUrl` Laf 应用链接，格式为 `https://APPID.laf.run`，APPID 为你的 Laf 应用的 appid

`dbProxyUrl` 数据库访问策略入口，格式为 `/proxy/` 开头加上你新建策略名，如果不需要操作数据库，可不填此参数

`getAccessToken` 请求时带的 token，token 为 JWT token，如果不涉及权限可空

`environment` 目前兼容三种环境 `wxmp`  `uniapp`  `h5`，`wxmp` 为微信小程序

## 微信小程序中使用

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => wx.getStorageSync('access_token'),
  environment: "wxmp",
});
```

::: warning
微信小程序中使用 NPM 依赖，需要 `构建NPM`
:::

### `Typescript` 版微信小程序构建方法

1、终端 npm 初始化，在小程序项目文件夹中执行 `npm init -y`

2、安装客户端 SDK，在小程序项目文件夹中执行 `npm i laf-client-sdk`

3、修改 project.config.json

setting 下新增：

```typescript
"packNpmManually": true,
"packNpmRelationList": [
  {
    "packageJsonPath": "./package.json",
    "miniprogramNpmDistDir": "miniprogram/"
  }
]
```

4、构建 NPM，微信开发者工具中，点击"工具"-"构建 npm"

5、页面中调用 SDK 的功能

### `Javascript` 版微信小程序构建方法

1、终端 npm 初始化，在小程序项目文件夹中执行 `npm init -y`

2、安装客户端 SDK，在小程序项目文件夹中执行 `npm i laf-client-sdk`

3、构建 NPM，微信开发者工具中，点击"工具"-"构建 npm"

6、页面中调用 SDK 的功能

## UNI-APP 中使用

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => uni.getStorageSync("access_token"),
  environment: "uniapp",
});
```

## H5 中使用

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => localStorage.getItem("access_token"),
  environment: "h5",
});
```

## 调用云函数

::: tip
`laf-client-sdk` 调用云函数只支持 POST 请求云函数
:::

```typescript
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

:::tip
通过 `laf-client-sdk` 我们可以像在云函数中一样操作数据库。
还有就是需要配合相对应的访问策略。
:::

```typescript
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app", //数据库访问策略
  getAccessToken: () => localStorage.getItem("access_token"),
});
const db = cloud.database()

// 获取用户表中的数据。
const res = await db.collection('user').get()
```
