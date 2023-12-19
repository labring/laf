

# 查询数组类型字段

本节介绍如何查询文档中的数组类型字段。

假设我们有如下文档：

```json
[
  {
    "name": "张三",
    "age": 18,
    "hobbies": ["乒乓球", "足球"],
    "serviceYears": [2009, 2010, 2011, 2012]
  },
  {
    "name": "李四",
    "age": 20,
    "hobbies": ["乒乓球", "羽毛球"],
    "serviceYears": [2011, 2012, 2013, 2014]
  }
]
```

## 查询数组中包含某个元素的文档

下面的示例查询所有喜欢打乒乓球的用户。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({  
      hobbies: '乒乓球'
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
    name: '张三',
    age: 18,
    hobbies: ['乒乓球', '足球']
  },
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '李四',
    age: 20,
    hobbies: ['乒乓球', '羽毛球']
  }
]
```
:::

## 配合条件操作符查询数组中的元素

下面的示例查询服役年份大于等于 2011 年的用户。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({  
      serviceYears: { $gte: 2011 }
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
    name: '张三',
    age: 18,
    serviceYears: [2009, 2010, 2011, 2012]
  },
  {
    _id: new ObjectId("65797a86f313010ca6017f6f"),
    name: '李四',
    age: 20,
    serviceYears: [2011, 2012, 2013, 2014]
  }
]
```
:::


## 更多用法

::: info 引用链接
- [查询数组](https://www.mongodb.com/docs/manual/tutorial/query-arrays/#query-an-array)
- [查询数组中的嵌套文档](https://www.mongodb.com/docs/manual/tutorial/query-array-of-documents/)
:::