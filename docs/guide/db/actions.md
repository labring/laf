---
title: 云数据库操作
---

# {{ $frontmatter.title }}

## 新增文档

### 方法 1： `collection.add(data)`

示例：

| 参数 | 类型   | 必填 | 说明                                       |
| ---- | ------ | ---- | ------------------------------------------ |
| data | object | 是   | {\_id: '10001', 'name': 'Ben'} \_id 非必填 |

```js
//promise
collection
  .add({
    name: "Ben",
  })
  .then((res) => {});
```

### 方法 2： `collection.doc().set(data)`

也可通过 `set` 方法新增一个文档，需先取得文档引用再调用 `set` 方法。
如果文档不存在，`set` 方法会创建一个新文档。

```js
//promise
collection.doc().set({
  name: "Hey",
});
```

## 删除文档

### 方式 1 通过指定文档 ID

`collection.doc(\_id).remove()`

```js
// 清理全部数据
collection
  .get()
  .then((res) => {
    const promiseList = res.data.map((document) => {
      return collection.doc(document.id).remove();
    });
    Promise.all(promiseList);
  })
  .catch((e) => {});
```

### 方式 2 条件查找文档然后直接批量删除

`collection.where().remove()`

```js
// 删除字段a的值大于2的文档
//promise
collection
  .where({
    a: _.gt(2),
  })
  .remove()
  .then(function (res) {});
```

## 更新文档

### 更新指定文档

`collection.doc().update()`

```js
collection.doc("doc-id").update({
  name: "Hey",
});
```

### 更新文档，如果不存在则创建

`collection.doc().set()`

```js
//promise
collection
  .doc("doc-id")
  .set({
    name: "Hey",
  })
  .then(function (res) {});
```

### 批量更新文档

`collection.update()`

```js
//promise
collection
  .where({ name: _.eq("hey") })
  .update({
    age: 18,
  })
  .then(function (res) {});
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
