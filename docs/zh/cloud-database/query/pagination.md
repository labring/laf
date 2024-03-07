

# 对文档进行分页查询

## 概述

分页查询是指将查询结果分页返回，以便于客户端进行分页展示。在云数据库中，分页查询可以通过 `limit` 和 `skip` 来实现。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({})
    .skip(0)
    .limit(10)
    .toArray()

  console.log(docs)
}
```

其中 `skip` 用于指定跳过的文档数量，`limit` 用于指定返回的文档数量，即每页的文档数量。
上述代码中，我们指定跳过 0 个文档，返回 10 个文档，即返回第 1 页的文档。


## 分页查询示例

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function (ctx: FunctionContext) {
  // 每页的文档数量，默认为 10
  const pageSize = ctx.query.pageSize || 10

  // 当前页码，默认为第一页
  const pageIndex = ctx.query.pageIndex || 1

  // 计算查询的起始位置，即跳过的文档数量
  const skip = pageSize * (pageIndex - 1)

  // 查询文档
  const docs = await db.collection('users')
    .find({})
    .skip(skip)
    .limit(pageSize)
    .toArray()
  
  // 查询总数
  const total = await db.collection('users').countDocuments()

  return {
    list: docs,
    total,
    pageSize,
    pageIndex
  }
}
```

::: info 更多参考
- [skip() 完整说明](https://www.mongodb.com/docs/manual/reference/method/cursor.skip/)
- [limit() 完整说明](https://www.mongodb.com/docs/manual/reference/method/cursor.limit/)
- [API: skip()](https://mongodb.github.io/node-mongodb-native/5.0/classes/FindCursor.html#skip)
- [API: limit()](https://mongodb.github.io/node-mongodb-native/5.0/classes/FindCursor.html#limit)
:::
