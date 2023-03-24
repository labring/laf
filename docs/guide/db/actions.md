---
title: 云数据库操作
---

# {{ $frontmatter.title }}

## 新增文档

下例向 user 集合中添加了一条记录。
```ts
import cloud from '@lafjs/cloud'

const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // 向 user 集合中添加一条记录
  const res = db.collection('user').add({ name: "jack" })
  console.log(res)

}
```

当然我们也可以批量添加多条记录,只需要多传入一个对象`{ multi: true }`即可。
```ts
const list = [
  { name: "jack" },
  { name: "rose" }
]
// 向 user 集合中加入多条记录
const res = await db.collection('user').add(list, { multi: true })
console.log(res)
```

## 删除文档

### 通过指定条件删除
我们可以配合 `where` 以及各种高级指令来使用 `remove`。

```js
  // 删除 user 集合中，name 为 jack 的一条记录
  const res = await db.collection('user').where({ name: "jack" }).remove()
  console.log(res)
```

### 条件查找然后批量删除

上面示例执行一次只能删除一条数据，如果想要批量删除要在 `remove()` 中添加 `{multi: true}`

```js
// 删除 user 表中所有 name 为 jack 的记录
await db.collection('user').where({ name: "jack" }).remove({ multi: true })
```
### 清空集合（危险操作）
如果我们想删除一个集合中的所有数据，可以这样操作。
```js
// 清空 user 集合
await db.collection('user').remove({ multi: true })
```

## 更新文档

### 更新指定文档

我们这里把 jack 的名字改为 j 。
```js
await db.collection('user').where({ name: 'jack' }).update({ name: "j" })
```

同样我们也可以一次更新多个属性，比如:更改名字的同时也更改年龄。
```js
await db.collection('user').where({ name: 'jack' }).update({ name: "j", age: "18" })
```

### 批量更新文档
这里我们没有加条件限制，直接把 user 表中的所有 name 都改成了 j ，操作和之前一样只需要多传入一个对像`{multi:true}`即可。
```js
await db.collection('user').update({ name: "j" },{multi:true})

```

## 更新指令

### set

更新指令。用于设定字段等于指定值。这种方法相比传入纯 JS 对象的好处是能够指定字段等于一个对象：

```js
// 以下方法只会更新 property.location 和 property.size，如果 property 对象中有
//promise
db.collection("photo")
  .doc("doc-id")
  .update({
    data: {
      property: {
        location: "guangzhou",
        size: 8,
      },
    },
  })
  .then(function (res) {});
```

### inc

更新指令。用于指示字段自增某个值，这是个原子操作，使用这个操作指令而不是先读数据、再加、再写回的好处是：

1. 原子性：多个用户同时写，对数据库来说都是将字段加一，不会有后来者覆写前者的情况
2. 减少一次网络请求：不需先读再写

之后的 mul 指令同理。

如给收藏的商品数量加一：

```js
const _ = db.command;
//promise
db.collection("user")
  .where({
    _openid: "my-open-id",
  })
  .update({
    count: {
      favorites: _.inc(1),
    },
  })
  .then(function (res) {});
```

### mul

更新指令。用于指示字段自乘某个值。

### remove

更新指令。用于表示删除某个字段。如某人删除了自己一条商品评价中的评分：

```js
//promise
const _ = db.command;
db.collection("comments")
  .doc("comment-id")
  .update({
    rating: _.remove(),
  })
  .then(function (res) {});
```

### push

向数组尾部追加元素，支持传入单个元素或数组

```js
const _ = db.command;
//promise
db.collection("comments")
  .doc("comment-id")
  .update({
    // users: _.push('aaa')
    users: _.push(["aaa", "bbb"]),
  })
  .then(function (res) {});
```

### pop

删除数组尾部元素

```js
const _ = db.command;
//promise
db.collection("comments")
  .doc("comment-id")
  .update({
    users: _.pop(),
  })
  .then(function (res) {});
```

### unshift

向数组头部添加元素，支持传入单个元素或数组。使用同 push

### shift

删除数组头部元素。使用同 pop
