---
title: 在客户端中调用
---

# {{ $frontmatter.title }}

云函数编写完成并发布后，客户端可通过 `sdk` 的方式进行调用。

::: info
目前 SDK 暂时只支持发送 POST 请求
:::

## 前端项目中安装sdk

```shell
npm i laf-client-sdk
```

## 初始化 `cloud` 对象：
```typescript
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https:/<APP_ID>.laf.run",   // <APP_ID> 在首页应用列表获取
  getAccessToken: () => "",    // 这里不需要授权，先填空
})
```

## 调用云函数

```typescript
// 这里的第一个参数就是云函数的名字，第二个参数是传入的数据，对应云函数中的 ctx.body
const res = await cloud.invoke('get-user-info', { userid })

console.log(res)     // 这里的 res 是云函数中 return 的内容
```

怎么样，是不是很方便， 只需简单的配置和一行代码即可实现对云函数的调用。


