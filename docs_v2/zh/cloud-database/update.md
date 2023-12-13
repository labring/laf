
# 云数据库 - 更新文档

## 概述

你可以使用更新和替换操作修改集合中的文档。

更新操作修改文档的字段和值，同时保持其他字段和值不变。替换操作将现有文档中的所有字段和值替换为指定的字段和值，同时保持 _id 字段值不变。

Node.js 驱动程序提供了以下方法来更改文档：

- `updateOne()`
- `updateMany()`
- `replaceOne()`

## 更新单个文档

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const ret = await db.collection('users').updateOne({
    name: '王小波'
  }, {
    $set: { age: 1000 }
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


::: info API 文档
- [db.collection.updateOne()](https://www.mongodb.com/docs/manual/reference/method/db.collection.updateOne/)
- [Collection.updateOne()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#updateOne)
:::


## 更新多条文档

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const ret = await db.collection('users').updateMany({
    createdAt: { $exists: false }
  }, {
    $set: { createdAt: new Date() }
  })

  console.log(ret)
}
```

::: details 查看输出
```js
{
  acknowledged: true,
  modifiedCount: 2,
  upsertedId: null,
  upsertedCount: 0,
  matchedCount: 2
}
```

::: info API 文档
- [db.collection.updateMany()](https://www.mongodb.com/docs/manual/reference/method/db.collection.updateMany/)
- [Collection.updateMany()](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#updateMany)
:::
