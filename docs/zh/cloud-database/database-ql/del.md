---
title: 删除数据
---

# 删除数据

Laf 云数据库删除数据，包括删除文档和删除集合。同时支持单个删除和批量删除。

## 通过指定条件删除单个文档

我们可以配合 `where` 以及各种高级指令来使用 `remove`。

```js
  // 删除 user 集合中，name 为 jack 的一条记录
  const res = await db.collection('user').where({ name: "jack" }).remove()
  console.log(res)
```

## 通过指定条件批量删除文档

上面示例执行一次只能删除一条数据，如果想要批量删除要在 `remove()` 中添加 `{multi: true}`

```js
// 删除 user 表中所有 name 为 jack 的记录
await db.collection('user')
.where({ name: "jack" })
.remove({ multi: true })
```

## 清空集合（危险操作）

如果我们想删除一个集合中的所有数据，可以这样操作。

```js
// 清空 user 集合
await db.collection('user').remove({ multi: true })
```
