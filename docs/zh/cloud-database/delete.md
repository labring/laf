
# 云数据库 - 删除文档

本节将介绍如何从云数据库中删除集合中的文档。

::: info 本节目录
[[toc]]
:::

## 删除单条文档

如果您想从集合中删除现有文档，可以使用 `deleteOne()` 删除一个文档，该方法接受一个查询条件，匹配您想要删除的文档。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const ret = await db.collection('users').deleteOne({
    name: 'laf'
  })

  console.log(ret)
}
```

::: details 查看输出
```js
{
  acknowledged: true,
  deletedCount: 1
}
```
:::

::: info 更多参考
- [db.collection.deleteOne() 完整说明](https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteOne/)
- [API: Collection.deleteOne()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#deleteOne)
:::


## 删除多条文档

如果您想从集合中删除多个文档，可以使用 `deleteMany()` 删除多个文档，该方法接受一个查询条件，匹配您想要删除的文档。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  // 删除 age 小于 10 的文档
  const ret = await db.collection('users').deleteMany({
    age: { $lt: 10 }
  })

  console.log(ret)
}
```

::: details 查看输出
```js
{
  acknowledged: true,
  deletedCount: 2
}
```
:::

::: info 更多参考
- [db.collection.deleteMany() 完整说明](https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteMany/)
- [API: Collection.deleteMany()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#deleteMany)
:::


## 下一步
::: tip
- [插入文档](./insert.md)
- [查询文档](./find.md)
- [更新文档](./update.md)
:::