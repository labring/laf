---
title: 在客户端中调用
---

# {{ $frontmatter.title }}

云函数编写完成并发布后，客户端可通过 `sdk` 的方式进行调用。

::: info
目前 SDK 暂时只支持发送 POST 请求
:::

## 安装sdk

```shell
npm i laf-client-sdk
```

## 初始化 `cloud` 对象：
```typescript
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "APP_ID.laf.run",   // App id 可在首页应用列表中获取
  getAccessToken: () => "",    // 这里不需要授权，先填空
})
```

## 调用云函数

```typescript
const res = await cloud.invoke('get-user-info', { userid })

console.log(res)     // user data find by id
```

怎么样，是不是很方便， 只需简单的配置和一行代码即可实现对云函数的调用。


