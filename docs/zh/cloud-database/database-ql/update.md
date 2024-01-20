---
title: 更新数据
---

# 更新数据

Laf 云数据库更新数据，实际上就是针对集合中的文档进行修改，通过 `where` 等操作符设置查询条件，然后通过 `update` 或 `set` 等更新操作符进行修改。

## 更新文档

### 更新指定文档

我们这里把 jack 的名字改为 Tom。

```typescript
await db.collection('user')
.where({ name: 'jack' })
.update({ name: "Tom" })
```

同样我们也可以一次更新同一个文档的多个属性，比如：更改名字的同时也更改年龄。

```typescript
await db.collection('user')
.where({ name: 'jack' })
.update({ name: "Tom", age: "18" })
```

### 批量更新文档

这里我们没有加条件限制，直接把 `user` 表中的所有 `name` 都改成了 `Tom` ，操作和之前一样只需要多传入一个对像 `{multi:true}` 即可。

```typescript
await db.collection('user')
.update({ name: "Tom" },{ multi:true })
```

## 更新指令

### set

更新指令。如果数据不存在，则会新增一个文档。

::: warning
注意：使用 `set` 需要使用 `doc` 去根据 ID 查询文档，然后进行更新，如果查询不到文档，则会新增一个文档。
:::

```typescript
await collection.doc('644148fd1eeb2b524dba499e').set({
  name: "Hey"
})
```

### inc

更新指令。用于指示字段自增某个值，需要是正整数或者负整数。这是个原子操作，使用这个操作指令而不是先读数据、再加、再写回的好处是：

1. 原子性：多个用户同时写，对数据库来说都是将字段加一，不会有后来者覆写前者的情况
2. 减少一次网络请求：不需先读再写

之后的 mul 指令同理。

如给收藏的商品数量加一：

```typescript
const _ = db.command;
await db.collection("user")
  .where({
    _openid: "my-open-id",
  })
  .update({
    count: {
      favorites: _.inc(1),
    },
  })
```

### mul

更新指令。用于指示字段自乘某个值。需要是正整数或者负整数或者 0。

### remove

更新指令。用于表示删除某个字段。如某人删除了自己一条商品评价中的评分：

```typescript
const _ = db.command;
await db.collection("comments")
  .doc("comment-id")
  .update({
    rating: _.remove(),
  })
```

### push

向数组尾部追加元素，支持传入单个元素或数组

```typescript
const _ = db.command;
await db.collection("comments")
  .doc("comment-id")
  .update({
    // users: _.push('aaa')
    users: _.push(["aaa", "bbb"]),
  })
```

### pop

删除数组尾部元素

```typescript
const _ = db.command;
await db.collection("comments")
  .doc("comment-id")
  .update({
    users: _.pop(),
  })
```

### unshift

向数组头部添加元素，支持传入单个元素或数组。使用同 push

### shift

删除数组头部元素。使用同 pop
