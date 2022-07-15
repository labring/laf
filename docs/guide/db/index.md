---
title: 云数据库介绍
---

# {{ $frontmatter.title }}

云数据库是基于 MongoDB 实现的，其中的绝大多数概念、操作和 MongoDB 是一致的。

## 基本概念

### 文档

数据库的每一条记录都是类似于 JSON 的文档：

```js
{
  "username": "hello",
  "password": "123456",
  "extraInfo": {
    "mobile": "15912345678"
  }
}
```

### 集合

集合是一组文档的集合，每个文档都在一个集合里面。如所有的用户放在 `users` 集合里。

### 数据库

每个 Laf 应用有且仅有一个数据库，但是一个数据库可以创建多个集合。

## 访问数据库

### 在云函数中访问数据库

云函数需要使用 `@/cloud-sdk` 来获取数据库访问器。

```js
import cloud from "@/cloud-sdk";

// 数据库对象
const db = cloud.database();
```

### 在客户端中访问数据库

前端可使用 [laf-client-sdk](https://github.com/lafjs/laf/tree/main/packages/client-sdk) “直连”数据库，无需与服务端对接口。

在访问数据库之前，需要先设置一个访问策略。在 云数据库-访问策略 中创建一个新的策略，策略内容如下：

```js
{
  "read": true,
  "count": true,
  "update": false,
  "remove": false,
  "add": false
}
```

创建好后可以在 访问策略列表中获得入口地址。

在前端项目中安装 laf-client-sdk:

```shell
npm install laf-client-sdk
```

在使用前，需要初始化 SDK：

```js
const cloud = require("laf-client-sdk").init({
  // 应用的服务地址，在欢迎-服务地址 可找到
  baseUrl: "http://localhost:8000",
  // 刚刚创建的访问策略的入口地址
  dbProxyUrl: "/proxy/app",
  // provide your own token-get-function, a standard JWT token is expected
  getAccessToken: () => localStorage.getItem("access_token"),
  /**
   * 客户端环境, 默认是 'h5':
   * - `h5` for browsers
   * - `wxmp` for WeChat MiniProgram
   * - `uniapp` for uni-app
   */
  environment: "h5",
});

// 获取数据库访问器
const db = cloud.database();
```

## 数据类型

云数据库提供了如下的类型：

- String：字符串
- Number：数字
- Object：对象
- Array：数组
- Bool：布尔值
- GeoPoint：地理位置点
- GeoLineStringL: 地理路径
- GeoPolygon: 地理多边形
- GeoMultiPoint: 多个地理位置点
- GeoMultiLineString: 多个地理路径
- GeoMultiPolygon: 多个地理多边形
- Date：时间
- Null

### 1. Date 类型

Date 类型用于表示时间，精确到毫秒，可以用 JavaScript 内置 Date 对象创建。需要特别注意的是，用此方法创建的时间是客户端时间，不是服务端时间。如果需要使用服务端时间，应该用 API 中提供的 serverDate 对象来创建一个服务端当前时间的标记，当使用了 serverDate 对象的请求抵达服务端处理时，该字段会被转换成服务端当前的时间，更棒的是，我们在构造 serverDate 对象时还可通过传入一个有 offset 字段的对象来标记一个与当前服务端时间偏移 offset 毫秒的时间，这样我们就可以达到比如如下效果：指定一个字段为服务端时间往后一个小时。

那么当我们需要使用客户端时间时，存放 Date 对象和存放毫秒数是否是一样的效果呢？不是的，我们的数据库有针对日期类型的优化，建议大家使用时都用 Date 或 serverDate 构造时间对象。

```js
//服务端当前时间
new db.serverDate();
```

```js
//服务端当前时间加1S
new db.serverDate({
  offset: 1000,
});
```

### Null 类型

Null 相当于一个占位符，表示一个字段存在但是值为空。
