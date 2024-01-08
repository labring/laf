
# 云数据库快速入门

本文通过 3 分钟，快速介绍如何操作云数据库。

::: info 本节目录
[[toc]]
:::

## 获取数据库实例

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db
```

## 插入文档

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
  insertedId: new ObjectId("65797a86f313010ca6017f6f")
}
```
:::


## 查询文档

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


## 更新文档

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const ret = await db.collection('users').updateOne({
    name: '王小波'
  }, {
    $set: {
      age: 1000
    }
  })

  console.log(ret)
}
```

::: details 查看输出
```js
{
  acknowledged: true,
  modifiedCount: 1,
  upsertedId: null,
  upsertedCount: 0,
  matchedCount: 1
}
```
:::

## 删除文档

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const ret = await db.collection('users').deleteOne({
    name: '张小柱'
  })

  console.log(ret)
}
```

::: details 查看输出
```js
{ 
  acknowledged: true,
  deletedCount: 0   // 由于没有找到张小柱，所以删除数量为 0
}
```
:::

## 下一步

::: tip 
- [插入文档](./insert.md)
- [查询文档](./find.md)
- [更新文档](./update.md)
- [删除文档](./delete.md)

>_Laf 使用的数据库 API 是 [MongoDb 官方 Node.js SDK](https://www.mongodb.com/docs/drivers/node/v5.0/quick-reference/)，你也可以直接参考官方文档。_
:::
