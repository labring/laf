---
title: 云数据库介绍
---

# {{ $frontmatter.title }}

Laf 云数据库提供了开箱即用的数据库，无需复杂配置和连接。在云函数中可通过 `cloud.database()` 新建 DB 实例去操作数据库。

Laf 云数据库是使用的 `MongoDB` ，既保留了 `MongoDB` 原生查询数据库操作方法，也封装了更方便的操作方法。

Laf 云数据库是一个 JSON 格式的文档型数据库，数据库中的每条记录都是一个 JSON 格式的文档。因此在 Laf 数据库中，集合对应 MySQL 的数据表，文档对应 MySQL 的行，字段对应 MySQL 的列。

## 基本概念

### 文档

数据库的每条记录都是一个 JSON 格式的文档，如：

```typescript
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

```typescript
[
  {
    "username": "name1",
    "password": "123456",
    "extraInfo": {
      "mobile": "15912345678"
    }
  },
  {
    "username": "name2",
    "password": "12345678",
    "extraInfo": {
      "mobile": "15912345679"
    }
  }
  ...
]
```

### 数据库

每个 Laf 应用有且仅有一个数据库，但是一个数据库可以创建多个集合。

![dblist](/doc-images/dblist.jpg)

上图代表当前 Laf 应用下有 2 个集合，分别是 `test` 集合和 `messages` 集合

同时在 Laf 的 `Web IDE` 中可以很方便的看到全部的集合列表，以及简单的管理。

## 数据类型

云数据库提供了以下类型：

__常用数据类型__

- `String` 字符串类型，存储任意长度的 UTF-8 编码的字符串
- `Number` 数字类型，包括整数和浮点数
- `Boolean` 布尔类型，包括 true 和 false
- `Date` 日期类型，存储日期和时间
- `ObjectId` 对象 ID 类型，用于存储文档的唯一标识符
- `Array` 数组类型，可以包含任意数量的值，包括其他数据类型和嵌套数组
- `Object` 对象类型，可以包含任意数量的键值对，其中值可以是任何数据类型，包括其他对象和嵌套数组

__其他数据类型__

- `Null` 相当于一个占位符，表示一个字段存在但是值为空
- `GeoPoint` 地理位置点
- `GeoLineStringLine` 地理路径
- `GeoPolygon` 地理多边形
- `GeoMultiPoint` 多个地理位置点
- `GeoMultiLineString` 多个地理路径
- `GeoMultiPolygon` 多个地理多边形

### Date 类型

Date 类型用于表示时间，精确到毫秒，可以用 JavaScript 内置 Date 对象创建。

::: warning
注意：当前服务端时间可能会有时区问题，可能不是东八区时间，在存储数据库的时候，可以先把时区转换成东八区或者使用时间戳
:::

在云函数中，可以直接使用 `new Date()` 获取当前服务端时间

```typescript
//服务端当前时间
console.log(new Date())
// 输出结果：2023-04-21T14:47:32.697Z

const date = new Date();
const timestamp = date.getTime();
console.log(timestamp); 
// 输出一个以毫秒为单位的时间戳，例如：1650560477427
```

获取东八区时间

```typescript
// 获取当前时间的东八区时间
const date = new Date();
const offset = 8; // 东八区偏移量为 +8

// 计算当前时间的 UTC 时间，再加上偏移量得到东八区时间
const utcTime = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
const beijingTime = new Date(utcTime + (offset * 60 * 60 * 1000));
console.log(beijingTime); // 输出东八区时间的 Date 对象
```

下面演示云函数在 `test` 集合中添加一条记录，并添加创建时间 `createTime` 和创建时间戳 `createTimestamp` 2 个字段

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {

  // 获取当前时间的东八区时间
  const date = new Date();
  const offset = 8; // 东八区偏移量为 +8

  // 计算当前时间的 UTC 时间，再加上偏移量得到东八区时间
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
  const beijingTime = new Date(utcTime + (offset * 60 * 60 * 1000));
  console.log(beijingTime); // 输出东八区时间的 Date 对象

  await db.collection('test').add({
    name: 'xiaoming',
    createTime: beijingTime,
    createTimestamp: date.getTime()
  })
}
```

### Null 类型

Null 相当于一个占位符，表示一个字段存在但是值为空。
