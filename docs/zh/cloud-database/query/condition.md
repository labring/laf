
# 条件查询

## 概述

大多数 CRUD 操作允许你指定查询条件来缩小匹配文档的范围。查询条件包含一个或多个查询操作符，应用于特定字段，用于确定哪些文档包含在结果集中。

在查询条件中，您可以将字段与字面值进行匹配，例如 `{ title: 'The Room' }`，也可以组合查询操作符来表达更复杂的匹配条件。

在本节中，我们将介绍以下类别的查询操作符，并展示如何使用它们：

- 比较操作符
- 逻辑操作符


## 比较操作符

| 名称 | 描述 |
| --- | --- |
| `$eq` | 匹配字段值等于指定值的文档。 |
| `$gt` | 匹配字段值大于指定值的文档。 |
| `$gte` | 匹配字段值大于或等于指定值的文档。 |
| `$in` | 匹配字段值等于指定数组中任意值的文档。 |
| `$lt` | 匹配字段值小于指定值的文档。 |
| `$lte` | 匹配字段值小于或等于指定值的文档。 |
| `$ne` | 匹配字段值不等于指定值的文档。 |
| `$nin` | 匹配字段值不等于指定数组中任意值的文档。 |


### `$gt` `$lt` 示例

你可以使用多个查询操作符来组合查询条件。例如，以下查询条件将匹配年龄大于 40 且小于 50 的用户：

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  // 查询年龄大于 40 且小于 50 的用户
  const docs = await db.collection('users')
    .find({ 
      age: { $gt: 40, $lt: 50 }
    })
    .toArray()

  console.log(docs)
}
```


### `$in` 示例

以下示例将匹配年龄为 12、24 或 36 的用户：

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({ 
      age: { $in: [12, 24, 36] }
    })
    .toArray()

  console.log(docs)
}
```

## 逻辑操作符

| 名称 | 描述 |
| --- | --- |
| `$and` | 匹配同时满足所有查询条件的文档。 |
| `$not` | 匹配不满足查询条件的文档。 |
| `$nor` | 匹配不满足所有查询条件的文档。 |
| `$or` | 匹配满足任意查询条件的文档。 |

### `$or` 示例

以下示例将查询满足法定婚龄的用户：
- 男性年龄大于等于 22 岁
- 女性年龄大于等于 20 岁


```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users').find({
    $or: [
      { gender: '男', age: { $gte: 22 }},
      { gender: '女', age: { $gte: 20}}
    ]
  }).toArray()

  console.log(docs)
}
```

## 更多用法

::: info 引用链接
- [查询条件](https://www.mongodb.com/docs/drivers/node/v5.0/fundamentals/crud/query-document/)
- [逻辑操作符](https://www.mongodb.com/docs/manual/reference/operator/query-logical/)
- [比较操作符](https://www.mongodb.com/docs/manual/reference/operator/query-comparison/)
- [元素操作符](https://www.mongodb.com/docs/manual/reference/operator/query-element/)
- [数组操作符](https://www.mongodb.com/docs/manual/reference/operator/query-array/)
:::