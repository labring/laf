
# 云数据库 - 插入文档

本节介绍云数据库中插入文档的用法。

::: info 本节目录
[[toc]]
:::


## 概述

插入操作将一个或多个文档插入到集合中。Node.js 驱动程序提供了以下方法来执行插入操作：

- `insertOne()`
- `insertMany()`


## 插入单个文档

`insertOne()` 方法将一个文档插入到集合中。

如果集合不存在，`insertOne()` 方法会自动创建集合并插入文档。

执行成功后，该方法返回一个 `InsertOneResult` 实例，该实例表示新文档的 `_id`。


```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const ret = await db.collection('users').insertOne({ 
    name: '王小波',
    age: 44,
    books: ['黄金时代', '白银时代', '青铜时代']
  })

  console.log(ret)
}
```

::: details 查看输出
```js
{
  acknowledged: true,
  insertedId: new ObjectId("65798555f313010ca6017f72")
}
```
:::

::: info 更多参考
- [db.collection.insertOne() 完整说明](https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/)
- [API: Collection.insertOne()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#insertOne)
:::


## 插入多个文档

`insertMany()` 方法将一个或多个文档插入到集合中。

如果集合不存在，`insertMany()` 方法会自动创建集合并插入文档。

执行成功后，该方法返回一个 `InsertManyResult` 实例，该实例表示新文档的 `_id`。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const ret = await db.collection('users').insertMany([
    { 
      name: '王小波',
      age: 44,
      books: ['黄金时代', '白银时代', '青铜时代']
    },
    { 
      name: '孙连城',
      age: 33,
      books: ['无边的宇宙']
    }
  ])

  console.log(ret)
}
```

::: details 查看输出
```js
{
  acknowledged: true,
  insertedCount: 2,
  insertedIds: {
    '0': new ObjectId("6579853af313010ca6017f70"),
    '1': new ObjectId("6579853af313010ca6017f71")
  }
}
```
:::

::: info 更多参考
- [db.collection.insertMany() 完整说明](https://www.mongodb.com/docs/manual/reference/method/db.collection.insertMany/)
- [API: Collection.insertMany()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#insertMany)
:::


## 下一步
::: tip
- [查询文档](./find.md)
- [更新文档](./update.md)
- [删除文档](./delete.md)
:::