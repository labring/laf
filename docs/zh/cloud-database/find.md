
# 云数据库 - 查询文档

本节介绍在云数据库中查询文档的用法。

::: info 本节目录
[[toc]]
:::


## 概述

你可以执行查找操作以从云数据库检索数据。通过调用 `find()` 或 `findOne()` 方法来执行查找操作，以获取匹配查询条件的文档。

Node.js 驱动程序提供了以下方法来查找文档：

- `find()`
- `findOne()`
- `countDocuments`

## 查找单个文档

`findOne()` 方法返回集合中第一个匹配查询条件的文档。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const doc = await db.collection('users').findOne({
    name: '王小波'
  })

  console.log(doc)
}
```

::: details 查看输出
```js
{
  _id: new ObjectId("65797a86f313010ca6017f6f"),
  name: '王小波',
  age: 44,
  books: [ '黄金时代', '白银时代', '青铜时代' ]
}
```
:::

::: info 更多参考
- [db.collection.findOne() 完整说明](https://www.mongodb.com/docs/manual/reference/method/db.collection.findOne/)
- [API: Collection.findOne()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#findOne)
:::

## 查找多个文档

`find()` 方法返回集合中所有匹配查询条件的文档。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({ age: 44 })
    .toArray()

  console.log(docs)
}
```

::: details 查看输出
```js
[
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '王小波',
    age: 44,
    books: [ '黄金时代', '白银时代', '青铜时代' ]
  },
  {
    _id: new ObjectId("65797a86f313010ca6017f70"),
    name: '张小柱',
    age: 44,
    books: []
  }
]
```
:::

::: info 更多参考
- [db.collection.find() 完整说明](https://www.mongodb.com/docs/manual/reference/method/db.collection.find/)
- [API: Collection.find()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#find)
:::


## 查询文档数量

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const count = await db.collection('users')
    .countDocuments({ age: 44 })

  console.log(count)
}
```

::: info 更多参考
- [db.collection.countDocuments() 完整说明](https://www.mongodb.com/docs/manual/reference/method/db.collection.count/)
- [API: Collection.countDocuments()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#countDocuments)
:::

## 下一步
::: tip
- [插入文档](./insert.md)
- [更新文档](./update.md)
- [删除文档](./delete.md)

:::