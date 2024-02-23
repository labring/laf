---
title: 新增数据
---

# 新增数据

Laf 云函数库中，新增数据非常简单，正规说法为插入文档。以下是插入单个文档和批量插入文档的写法。

同时 Laf 云数据库是 `Schema Free` 的，意味着你可以插入任意的字段和数据类型。

::: tip
使用 `cloud.database()`新增数据的方法无法自定义 id，所有新增的数据，都会自动生成 id，生成的 id 类型为为 `string`

使用 `mongodb 原生写法` ，可以自定义 id，也可以自动生成 id，生成的 id 类型为 `ObjectId`
:::

## 插入单个文档

下例向 user 集合中添加了一条记录。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export default async function (ctx: FunctionContext) {
  // 向 user 集合中添加一条记录
  const res = await db.collection('user').add({ name: "jack" })
  console.log(res)
}
```

## 批量新增文档

当然我们也可以批量添加多条记录，只需要多传入一个对象`{ multi: true }`即可。

```typescript
const list = [
  { name: "jack" },
  { name: "rose" }
]
// 向 user 集合中加入多条记录
const res = await db.collection('user').add(list, { multi: true })
console.log(res)
```

## mongodb 原生写法

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export async function main(ctx: FunctionContext) {
  // 向 user 集合中插入单个文档
  const result1 = await db.collection('user').insertOne({ name: "jack" })
  console.log(result1)
  // 向 user 集合中批量插入文档
  const documents = [
    { name: "Jane Doe", age: 25 },
    { name: "Bob Smith", age: 40 }
  ];
  const result2 = await db.collection('user').insertMany(documents);
  console.log(result2)
}
```
