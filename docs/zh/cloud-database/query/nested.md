

# 嵌套文档查询

本节介绍如何查询嵌套文档。

嵌套文档是指文档中包含文档的情况，例如：

```json
[
  {
    "name": "张三",
    "age": 18,
    "address": {
      "city": "北京",
      "street": "中关村"
    }
  },
  {
    "name": "李四",
    "age": 20,
    "address": {
      "city": "上海",
      "street": "浦东"
    }
  }
]
```


## 使用 `.` 表示法对嵌套字段进行查询

下面的示例使用 `.` 表示法查询所有居住在北京的用户。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({  
      'address.city': '北京'
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
    address: {
      city: '北京',
      street: '中关村'
    }
  }
]
```
:::

## $in 操作符示例

以下示例将查询居住在北京或上海的用户。

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({ 
      'address.city': { $in: ['北京', '上海'] }
    })
    .toArray()

  console.log(docs)
}
```

## 更多用法

::: info 引用链接
- [嵌套文档查询](https://www.mongodb.com/docs/manual/tutorial/query-embedded-documents/)
- [查询条件](https://www.mongodb.com/docs/drivers/node/v5.0/fundamentals/crud/query-document/)
- [$in 用法](https://www.mongodb.com/docs/manual/reference/operator/query/in/#mongodb-query-op.-in)
:::