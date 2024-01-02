

# 使用正则进行模糊查询

## 概述

本节介绍如何使用正则表达式对文本字段进行模糊查询。


## 正则表达式查询

下面的示例使用正则表达式查询所有名字中包含`王`的用户。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({  
      name: { $regex: /王/ }
    })
    .toArray()

  console.log(docs)
}
```

::: details 查看输出
```js
[
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '王小波',
    age: 1000
  },
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '兰陵王',
    age: 30
  }
]
```
:::

## 在 `$in` 操作符中使用正则表达式

下面的示例使用正则表达式查询所有姓`王`或`陈`的用户，即首字为`王`或`陈`的用户。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({  
      name: { $in: [/^王/, /^陈/] } 
    })
    .toArray()

  console.log(docs)
}
```

::: details 查看输出
```js
[
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '王小波',
    age: 1000
  },
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '陈奕迅',
    age: 40
  }
]
```
:::


## $regex 和 $not 操作符组合使用

下面的示例使用 `$regex` 和 `$not` 操作符查询所有**不姓**`王`的用户。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({  
      name: { $not: { $regex: /^王/ } } 
    })
    .toArray()

  console.log(docs)
}
```

::: details 查看输出
```js
[
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '陈奕迅',
    age: 40
  },
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '兰陵王',
    age: 30
  }
]
```
:::


## 更多用法

::: info 引用链接
- [正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)
- [$regex 用法](https://docs.mongodb.com/manual/reference/operator/query/regex/)
- [$not 用法](https://docs.mongodb.com/manual/reference/operator/query/not/)
- [$in 用法](https://docs.mongodb.com/manual/reference/operator/query/in/)
:::