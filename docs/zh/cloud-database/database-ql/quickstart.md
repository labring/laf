---
title: 数据库入门
---

# 数据库入门

Laf 为每个应用提供了一个开箱即用的数据库，并且非常易用。下面是一个简单的数据库的增删改查的例子，来快速的了解 Laf 的数据库操作。

## 新建数据库实例

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 
// db 为新建的数据库实例
```

## 云函数插入文档

使用 `add` 方法可以往集合插入数据

如下例子：往 `user` 集合中添加一个文档，`name` 为 `Jack` 的数据

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').add({
    name: 'Jack'
  })
  console.log(res)
}
```

```json
// 集合 test 中会新增数据，_id 为自动生成
{
  "_id": "6442b2cac4f3afd9a186ecd9",
  "name": "Jack"
}
```

## 云函数查询文档

使用 `get` 方法可以查询集合中的文档

::: tip
`get` 方法一次最多能获取 100 条记录，如需一次查询更多请看数据查询文档
:::

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').get()
  console.log(res)
  // 查询结果
  // {
  //   data: [ { _id: '6442b2cac4f3afd9a186ecd9', name: 'Jack' } ],
  //   requestId: undefined,
  //   ok: true
  // }
}
```

使用 `getOne` 方法查询集合中的文档

::: tip
`getOne` 方法一次获取一条最新数据
:::

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').getOne()
  console.log(res)
  // 查询结果
  // {
  //   ok: true,
  //   data: { _id: '6442b2cac4f3afd9a186ecd9', name: 'Jack' },
  //   requestId: undefined
  // }
}
```

## 云函数修改文档

查出 `name` 为 `Jack` 的文档的_id，然后根据_id 修改文档

使用 `update` 方法修改文档

::: tip
`where` 可设置查询条件，`doc` 根据 id 查询
:::

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('test').where({
    name:'Jack'
  }).get()
  // console.log(res)
  const id = res.data[0]._id
  const updateRes = await db.collection('test').doc(id).update({
    name:'Tom'
  })
  console.log(updateRes)
  // 修改结果：updated:1 代表已成功修改 1 个文档
  // {
  //   requestId: undefined,
  //   updated: 1,
  //   matched: 1,
  //   upsertId: null,
  //   ok: true
  // }
}
```

## 云函数删除文档

先查出 `name` 为 `Tom` 的文档并删除

::: tip
`remove` 默认只能删除单条数据，如需批量删除，请查看数据删除文档
:::

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database() 

export async function main(ctx: FunctionContext) {
  const res = await db.collection('test').where({ name: "Tom" }).remove()
  console.log(res)
  // 删除结果：deleted:1 代表已成功删除 1 个文档
  // { requestId: undefined, deleted: 1, ok: true }
}
```

--------

相信一步一步跟着文档操作，已经初步的了解数据库的增删改查，但是如果需要深入使用数据库操作，还需要仔细查看后续的文档
